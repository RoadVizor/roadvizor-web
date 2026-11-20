# AGENTS.md - Roadvizor: FlowPredict (projeto individual)

Este arquivo orienta o agente de código sobre o tema, a persona e as regras de negócio do meu projeto individual, e sobre como trabalhar comigo. Leia o arquivo inteiro antes de alterar qualquer coisa.

Meu nome é Ancelmo. Escrevo e converso em português do Brasil.

Itens marcados com **[A CONFIRMAR]** ainda não foram decididos por mim. Não trate como definitivo e não invente valores: pergunte.

---

## 1. Tema

**Roadvizor** é um sistema de monitoramento de infraestrutura para **servidores de pedágio free flow** (pedágio sem cancelas, com cobrança feita por captura automática). Ele coleta métricas dos servidores, compara com limites definidos pela equipe técnica e ajuda a **antecipar falhas** antes que aconteçam.

## 2. Meu projeto individual: FlowPredict

**Análise preditiva de CPU e RAM dos servidores free flow usando regressão linear.**

- O cálculo da previsão acontece na **camada Gold do pipeline de dados** (ETL), nunca no front end.
- O resultado é publicado em **JSON** e consumido pela página **FlowPredict** do dashboard, que mostra o gráfico **real vs. previsto**.
- O objetivo de negócio é transformar histórico de consumo em **informação acionável**: para onde o consumo está indo e quão confiável é essa conclusão.
- O resumo gerado por IA **já está implementado**. Não refaça nem altere sem eu pedir.

---

## 3. Persona

**Vitória Nogueira**, analista de infraestrutura. É a pessoa que o FlowPredict precisa atender.

- **Perfil:** técnica, acompanha vários servidores free flow no dia a dia e precisa priorizar onde olhar primeiro. 
- **Objetivos:** evitar indisponibilidade dos servidores e saber quando um componente tende a atingir o limite. 
- **Dores:** descobrir o problema só depois que o limite foi estourado; não saber se uma tendência é confiável ou apenas ruído. 
- **Decisão que toma com o FlowPredict:** Consegue saber qual servidores priorizar e analisar quais são os seus servidores que podem apresentar problemas daqui um tempo determinado de acordo com as métricas.

**Regra para o agente:** todo KPI, gráfico, texto ou campo do JSON precisa ter resposta para a pergunta "que decisão a Vitória toma com isso?". Se não houver resposta, é decorativo: questione antes de implementar.

---

## 4. Regras de negócio

### Domínio

- **RN01.** Cada servidor é identificado pelo **endereço MAC**, armazenado com **12 caracteres, sem separador** (exemplo: `6C946647CDD1`).
- **RN02.** Cada servidor tem **componentes monitorados** (CPU, RAM, disco e placa de rede). O FlowPredict trata **somente CPU e RAM**.
- **RN03.** Os **limites de consumo** são definidos pelos usuários técnicos, **por servidor e por componente**, e ficam no banco. Nunca fixe limites no código.
- **RN04.** Unidades: **CPU em porcentagem** e **RAM em GiB**. Converta conforme o que está cadastrado no banco antes de calcular.
- **RN05.** Em **feriados** o consumo é maior (regra de negócio simulada na captura). É um padrão sazonal que a regressão linear não modela, então trate como limitação conhecida.

### Previsão

- **RN06.** A regressão é **independente para CPU e RAM** e **por servidor**.
- **RN07.** O modelo usa **todo o histórico disponível** do servidor (tempo como entrada, uso como saída), não apenas a captura mais recente.
- **RN08.** O **R²** é o indicador de confiança da previsão. Existe um **R² mínimo** para classificar a tendência. Abaixo dele, o resultado é tratado como **sem tendência confiável** e nunca se força uma classificação. Valor do R² mínimo: [A CONFIRMAR].
- **RN09.** Sempre exponha as **limitações** da regressão linear junto do resultado (poucos dados, oscilação, sazonalidade de feriado, relação não linear).
- **RN10.** A saída é um **JSON organizado por servidor e por componente**, salvo na camada Gold. O front apenas lê e apresenta.
- **RN11.** O processamento deve ser **idempotente**: rodar de novo sobre os mesmos dados não pode duplicar resultados.

### Dados de teste

- **RN12.** Testes usam um **servidor de teste** com CSV simulado. Nunca altere dados reais.
- **RN13.** Cenários a cobrir: **crescimento gradual, estável, oscilação e crescimento acentuado**. A classificação de tendência deve se comportar de forma coerente em cada um.


## 5. Glossário

- **Free flow:** pedágio sem cancelas, que depende de servidores sempre disponíveis.
- **Captura:** coleta periódica de métricas do servidor, gerando um CSV.
- **Bronze, Silver (trusted) e Gold:** camadas do data lake. Dado bruto, dado tratado e dado pronto para consumo.
- **Limite:** valor máximo aceitável de consumo, definido pela equipe técnica.
- **Tendência:** direção do consumo ao longo do tempo, indicada pela regressão.
- **R²:** quanto a reta explica a variação dos dados (de 0 a 1). Usado como indicador de confiança.

---

## 6. Stack (visão geral)

- Python para ETL e processamento, com scikit-learn para a regressão.
- Data lake em nuvem (AWS S3) com camadas bronze, silver e gold.
- Banco relacional (MySQL) com cadastros de servidores, componentes e limites.
- API que entrega ao client os componentes monitorados.
- Front end web com biblioteca de gráficos, consumindo o JSON da Gold.

Respeite a stack já existente. Não proponha trocar tecnologia sem eu pedir.

---

## 7. Como trabalhar comigo

Sou estudante de Ciência da Computação, no início do curso, e ainda estou construindo base em ETL, estatística e Python. Quero **entender** o que é feito, não apenas receber código.

1. **Avance progressivamente.** Uma etapa por vez, pequena o bastante para eu entender e validar. Não entregue uma implementação grande e pronta de uma vez.
2. **Explique o que mudou e por quê** a cada alteração de código.
3. **Evolua o arquivo existente** (script Gold atual). Não espalhe funcionalidades pequenas em vários arquivos. Só crie arquivo novo com justificativa clara.
4. **Comentários objetivos**, como em projeto profissional. Sem decoração e sem comentar o óbvio.
5. **Mudanças grandes** (estrutura, dependências, schema do banco): proponha o plano e espere minha aprovação.
6. **Seja honesto sobre limitações e riscos** (estatísticos, de dados, de arquitetura), mesmo quando eu não perguntar.
7. **Conceitos novos** (regressão, R², ETL, idempotência): explique de forma didática, ligada ao código do projeto.
8. **Métricas, KPIs e gráficos:** tenho dificuldade em defini-los. Parta da persona e da decisão que ela toma, e me faça perguntas guiadas em vez de entregar uma lista pronta.
9. **Credenciais** nunca no código: use variáveis de ambiente e mantenha fora do versionamento.

---

## 8. Fora de escopo

- Autenticação da API.
- Teste de consumo do JSON no front end.
- Alterações do squad na Gold. Este arquivo trata apenas do meu projeto individual.