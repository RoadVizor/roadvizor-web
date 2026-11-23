/* Controller para buscar arquivos JSON "front-ready" no S3 e retornar ao frontend.
   - Usa @aws-sdk/client-s3 (v3) para GetObject.
   - Respeita o prefixo configurável S3_PREFIX e valida companyId do token.
   - Retorna um objeto normalizado com chaves mínimas (kpis, grafico_horas, servidores, indice).
   Comentários inline explicam decisões de implementação.
*/
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

// Configura o cliente S3 usando variáveis de ambiente. Suporta AWS_SESSION_TOKEN (Lab).
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: process.env.AWS_SESSION_TOKEN
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN,
      }
    : {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
});

// Converte stream retornado por GetObjectCommand em string.
async function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

function ensureJsonExt(name) {
  if (!name) return name;
  return name.endsWith(".json") ? name : `${name}.json`;
}

// Lê o objeto S3 e faz JSON.parse; propaga erros para o chamador tratar.
async function getObjectJson(bucket, key) {
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  const resp = await s3Client.send(cmd);
  const body = await streamToString(resp.Body);
  return JSON.parse(body);
}

// Rota principal: obter dados de saúde para uma empresa e região/file opcionais.
async function obterSaude(req, res) {
  try {
    const prefix = process.env.S3_PREFIX || "saudeDashboard"; // configurável
    const bucket = process.env.S3_BUCKET;
    if (!bucket) {
      return res.status(500).json({ message: "S3_BUCKET não está configurado." });
    }

    // companyId deve vir do token (req.usuario) e, por segurança, não aceitar outro companyId
    const tokenCompanyId = req.usuario?.empresa_id;
    const requestedCompanyId = req.query.companyId || tokenCompanyId;
    if (!requestedCompanyId) {
      return res.status(400).json({ message: "companyId é obrigatório." });
    }
    if (String(requestedCompanyId) !== String(tokenCompanyId)) {
      // Protege isolamento por empresa (usuário só vê dados da sua empresa)
      return res.status(403).json({ message: "Acesso negado à empresa solicitada." });
    }

    const region = req.query.region; // ex: 'norte', 'indice', 'sem-regiao'
    const fileParam = req.query.file; // nome de arquivo explícito (override)

    // Resolve a key S3 seguindo o padrão acordado:
    // <S3_PREFIX>/<companyId>/todas.json (default)
    // <S3_PREFIX>/<companyId>/<region>.json
    // <S3_PREFIX>/<companyId>/<file>
    const base = `${prefix}/${requestedCompanyId}`;
    let key;
    if (fileParam) {
      key = `${base}/${ensureJsonExt(fileParam)}`;
    } else if (region) {
      if (region === "indice") {
        key = `${base}/indice.json`;
      } else if (region === "sem-regiao" || region === "sem-regiao.json") {
        key = `${base}/sem-regiao.json`;
      } else {
        key = `${base}/${ensureJsonExt(region)}`;
      }
    } else {
      key = `${base}/todas.json`;
    }

    let json;
    try {
      json = await getObjectJson(bucket, key);
    } catch (err) {
      // Silêncio por padrão — retornar 404 quando o arquivo não existe
      const notFound = err.name === "NoSuchKey" || /NotFound|NoSuchKey|NoSuchBucket/.test(err.message || "");
      if (notFound) return res.status(404).json({ message: "Arquivo não encontrado no S3." });
      console.error("Erro ao buscar S3:", err?.message || err);
      return res.status(500).json({ message: "Erro ao buscar dados no S3." });
    }

    // Minimal normalization: garante as chaves que o front espera
    const normalized = {
      kpis: json.kpis ?? {},
      grafico_horas: json.grafico_horas ?? {},
      servidores: json.servidores ?? json.servers ?? [],
      indice: json.indice ?? {},
    };

    return res.status(200).json(normalized);
  } catch (error) {
    console.error("Error in obterSaude:", error?.message || error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
}

module.exports = { obterSaude };
