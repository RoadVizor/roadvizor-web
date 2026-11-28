const database = require("../database/config");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
    region: process.env.AWS_REGION || "us-east-1"
});

const BUCKET_GOLD = process.env.AWS_BUCKET_GOLD || "datalake-gold-duda-sptech";
const PREFIXO_GOLD = "gold/";
const LIMITE_MINUTOS_LIGADO = 20;

function normalizarMac(mac) {
    return String(mac || "").replace(/[^a-fA-F0-9]/g, "").toUpperCase();
}

async function lerArquivoGold(nomeArquivo) {
    const resposta = await s3.send(new GetObjectCommand({
        Bucket: BUCKET_GOLD,
        Key: PREFIXO_GOLD + nomeArquivo
    }));

    const partes = [];

    for await (const parte of resposta.Body) {
        partes.push(parte);
    }

    const conteudo = Buffer.concat(partes).toString("utf-8").replace(/^\uFEFF/, "");
    const linhas = conteudo.trim().split(/\r?\n/);

    if (linhas.length < 2) return [];

    const colunas = linhas[0].split(";").map(coluna => coluna.trim());

    return linhas.slice(1).filter(linha => linha.trim() !== "").map(linha => {
        const valores = linha.split(";");
        const registro = {};

        colunas.forEach((coluna, indice) => {
            registro[coluna] = valores[indice] || "";
        });

        return registro;
    });
}

function filtrarServidor(registros, mac) {
    const macNormalizado = normalizarMac(mac);

    return registros
        .filter(registro => normalizarMac(registro.id_servidor) === macNormalizado)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

function converterNumero(valor) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : 0;
}

function dataISO(valor) {
    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? null : data.toISOString();
}

async function buscarServidores(empresa_id) {
    const instrucaoSql = `
        SELECT id_servidor, apelido, modelo, endereco_mac
        FROM servidor
        WHERE empresa_id = ?
        ORDER BY apelido;
    `;

    return database.executarComParametros(instrucaoSql, [empresa_id]);
}

async function buscarServidorPorID(empresa_id, id_servidor) {
    const instrucaoSql = `
        SELECT id_servidor, apelido, modelo, endereco_mac
        FROM servidor
        WHERE empresa_id = ?
          AND id_servidor = ?;
    `;

    return database.executarComParametros(instrucaoSql, [
        empresa_id,
        id_servidor
    ]);
}

async function buscarMetricasServidor(servidor) {
    const [cpu, ram, rede] = await Promise.all([
        lerArquivoGold("gold_cpu.csv"),
        lerArquivoGold("gold_ram.csv"),
        lerArquivoGold("gold_rede.csv")
    ]);

    const cpuServidor = filtrarServidor(cpu, servidor.endereco_mac);
    const ramServidor = filtrarServidor(ram, servidor.endereco_mac);
    const redeServidor = filtrarServidor(rede, servidor.endereco_mac);

    const ultimoCPU = cpuServidor[cpuServidor.length - 1];
    const ultimaRAM = ramServidor[ramServidor.length - 1];
    const ultimaRede = redeServidor[redeServidor.length - 1];

    const mapa = new Map();

    cpuServidor.forEach(registro => {
        const timestamp = dataISO(registro.timestamp);
        if (!timestamp) return;

        mapa.set(timestamp, {
            timestamp,
            cpu: converterNumero(registro.cpu_media),
            ram: null
        });
    });

    ramServidor.forEach(registro => {
        const timestamp = dataISO(registro.timestamp);
        if (!timestamp) return;

        const existente = mapa.get(timestamp) || {
            timestamp,
            cpu: null,
            ram: null
        };

        existente.ram = converterNumero(registro.ram_media);
        mapa.set(timestamp, existente);
    });

    const agora = new Date();
    const inicioJanela = new Date(agora);
    inicioJanela.setMinutes(0, 0, 0);
    inicioJanela.setHours(inicioJanela.getHours() - 7);

    const historico10min = Array.from(mapa.values())
        .filter(registro => {
            const data = new Date(registro.timestamp);
            return data >= inicioJanela && data <= agora;
        })
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const ultimaLeitura = historico10min.length > 0
        ? new Date(historico10min[historico10min.length - 1].timestamp)
        : null;

    const idadeMinutos = ultimaLeitura
        ? (agora.getTime() - ultimaLeitura.getTime()) / 60000
        : null;

    const ligado = idadeMinutos !== null &&
        idadeMinutos >= 0 &&
        idadeMinutos <= LIMITE_MINUTOS_LIGADO;

    const horaAtual = new Date(agora);
    horaAtual.setMinutes(0, 0, 0);

    const disponibilidade = [];

    for (let i = 7; i >= 0; i--) {
        const inicio = new Date(horaAtual);
        inicio.setHours(inicio.getHours() - i);

        const fim = new Date(inicio);
        fim.setHours(fim.getHours() + 1);

        const pontos = historico10min.filter(registro => {
            const data = new Date(registro.timestamp);
            return data >= inicio && data < fim;
        });

        disponibilidade.push({
            timestamp: inicio.toISOString(),
            label: inicio.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            }),
            disponivel: pontos.length > 0,
            quantidade_pontos: pontos.length
        });
    }

    return {
        servidor,
        status: ligado ? "Ligado" : "Desligado",
        ligado,
        ultima_atualizacao: ultimaLeitura ? ultimaLeitura.toISOString() : null,
        cpu: ultimoCPU ? converterNumero(ultimoCPU.cpu_media) : null,
        ram: ultimaRAM ? converterNumero(ultimaRAM.ram_media) : null,
        rede: {
            recebida_mb: ultimaRede ? converterNumero(ultimaRede.rede_recebida_mb) : null,
            enviada_mb: ultimaRede ? converterNumero(ultimaRede.rede_enviada_mb) : null
        },
        historico_10min: historico10min,
        disponibilidade
    };
}

module.exports = {
    buscarServidores,
    buscarServidorPorID,
    buscarMetricasServidor
};
