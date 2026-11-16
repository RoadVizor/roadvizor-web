const ambiente_processo = "desenvolvimento";
const caminho_env = ambiente_processo === "producao" ? ".env" : ".env.dev";

require("dotenv").config({ path: caminho_env });

const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

const PORTA_APP = process.env.APP_PORT;
const HOST_APP = process.env.APP_HOST;

const app = express();
const router = require("./src/routes/router");
const indexRouter = require("./src/routes/index");
const servidorRouter = require("./src/routes/servidor");
const logRouter = require("./src/routes/log")

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
app.use(cookieParser());

app.use(
    '/libs/chart.js',
    express.static('node_modules/chart.js/dist')
);

app.use("/", indexRouter);
app.use("/api", router);
app.use("/api/servidor", servidorRouter);

app.listen(PORTA_APP, function () {
  console.log(
    `Servidor Rodando em: http://${HOST_APP}:${PORTA_APP} | ambiente: ${ambiente_processo}`,
  );
});
