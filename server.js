const express = require("express");
const app = express();
const session = require("express-session");
const MongoStore = require("connect-mongo");
const advanceOptions = {useNewUrlParser:true, useUnifiedTopology: true};

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use("/log", express.static(__dirname + "/views"));
app.get("/log", (req, res) =>{
    res.sendFile('./views/login.html', {root: __dirname});
});

app.use(session({
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://root:1234@cluster0.hnjvbhu.mongodb.net/?retryWrites=true&w=majority",
        mongoOptions: advanceOptions
    }),
    secret: "secreto",
    resave: true,
    saveUninitialized: true
}));

const PORT = process.env.PORT || 8080;


app.post("/getCookies", (req, res) => {
    res.json(req.session);
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
        if (err){
            return res.send({status: "0", message: err});
        }
    });
    res.send({status: "1", message: "Hasta Luego "})
});

app.get("/logout2", (req, res) => {
    const user = req.session.user;
    req.session.destroy(err => {
        if (!err) res.json({status: "1", message: "Hasta Luego "+ user})
        else res.json({status: "0", message: err}) 
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

app.post("/login", (req, res) =>{
    const {user, pass} = req.body;
    if (user != "facu"){
        return res.json({status: '0', message: "Datos incorrectos"})
    }else if(pass != "1234"){
        return res.json({status: '0', message: "Datos incorrectos"})
    }else {
        if (req.session.contador){
            req.session.contador++;            
        }else {
            req.session.contador = 1;            
        }
        req.session.expires = 60000;
        req.session.user = user;
        req.session.admin = true;
        res.json({status: '1', message: "Bienvenido "+user});
    }    
});


const server = app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${server.address().port}`);
});

//export default app;