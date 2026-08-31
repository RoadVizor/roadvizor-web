var usuarioModel = require("../models/usuarioModel");
var jwt = require("jsonwebtoken");

async function autenticar(req, res, next) {
    var token = req.cookies.cookie_token
    console.log('Cookies: ', req.cookies.cookie_token);

    if (!token) {
        res.status(403).send({
        message: "Faça a autenticação"
    })};
    try {
        var payload = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Autenticação válida")
        next()
    } catch {
        console.log("Erro na autenticação")
    };
}

module.exports = autenticar;