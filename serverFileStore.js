/*const express = require("express");
const app = express();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const FileStore = require("session-file-store")(session);

app.use(express.json());
app.use(cookieParser());
app.use(session({
    store: new FileStore({path: './session',ttl:3000, retries:0}),
    secret: "secreto",
    resave: false,
    saveUninitialized: false
}));

const PORT = process.env.PORT || 8080;

app.post("/cookies", (req, res) => {
    const cookieName = req.body.name;
    const cookieVal = req.body.value;
    const expiration = req.body.expires;
    const faltantes = [];
    if (!cookieName) faltantes.push("cookieName")
    if (!cookieVal) faltantes.push("cookieVal")
    if (!expiration) faltantes.push("expiration")
    if (faltantes.length > 0) res.send({error: 'falta '+faltantes.join(", ")})
    res
        .cookie(cookieName, cookieVal, {maxAge: expiration})
        .send({process:"ok"});    
});

app.get("/getCookies", (req, res) => {
    res.send(req.cookies);
});

app.get("/con-session", (req, res) => {
    if (req.session.contador){
        req.session.contador++;
        res.send("Visitó el sitio "+ req.session.contador+ " veces");
    }else {
        req.session.contador = 1;
        res.send("Bienvenido");
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (!err) res.send("Sesion finalizada")
        else res.send({status: "error", body: err}) 
    });
});

function auth(req, res, next){
    if(req.session?.user === "Facu" && req.session?.admin){
        return next();
    }
    return res.status(401).send("Error de autenticacion");
}

app.get("/privado", auth, (req, res) => {
    res.send("Ok modo privado");
});

app.get("/login", (req, res) =>{
    const {user, pass} = req.query;
    if (user !== "Facu" && pass !== "1234"){
        return res.send("Datos incorrectos")
    }
    req.session.user = user;
    req.session.admin = true;
    res.send("Inicio correcto");
});

app.delete("/deleteCookies/:name", (req, res) =>{
    res.clearCookie(req.params.name).send(req.cookies);
});

const server = app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${server.address().port}`);
});

//export default app;
*/