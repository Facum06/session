const express = require("express");
const app = express();
const session = require("express-session");
const MongoStore = require("connect-mongo");
const advanceOptions = {useNewUrlParser:true, useUnifiedTopology: true};
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const PORT = process.env.PORT || 8080;
const mongoose = require("mongoose");
const  User  = require("./models/User");
const bcrypt = require("bcrypt");

mongoose.connect("mongodb+srv://root:1234@cluster0.hnjvbhu.mongodb.net/?retryWrites=true&w=majority")
        .then(() => console.log("DB CONECTADA"))
        .catch((err) => console.log(err));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use("/log", express.static(__dirname + "/views"));
app.use("/registerHome", express.static(__dirname + "/views"));
app.use("/home", express.static(__dirname + "/views"));
app.use("/login-error", express.static(__dirname + "/views"))

app.use(session({
    secret: "secreto",
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new LocalStrategy((username, password, done) => {     
      User.findOne({ username }, (err, user) => {
        if (err) console.log(err);
        if (!user) return done(null, false);
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) console.log(err);
            if (isMatch) return done(null, user);
            return done(null, false);
        });
      });
    })
  );

passport.serializeUser(function(user, done){
    done(null, user.id);
});
passport.deserializeUser( async function(id, done){    
    const user = await User.findById(id);
    done(null, user);
});

app.post("/register", (req, res) => {
    const {username, password , direccion} = req.body;    
    User.findOne({username}, async (err, user) => {
        if (err) return console.log(err);
        if (user) {
            return res.json({obj: user, status: "ok"}) //PLANILLA CON ERRORES SI HAY USER
        }
        if (!user) {//USUARIO INDEFINIDO
            const hashedPass = await bcrypt.hash(password, 10);
            const newUser = new User({
                username,
                password:hashedPass,
                direccion
            })
            await newUser.save();
            res.json({obj: newUser, status: "ok"});
        }               
    });
});

app.post("/login",passport.authenticate("local", { failureRedirect: "login-error" }), (req, res) => {
    const {username, password} = req.body;
    User.findOne({username}, (err, user) => {
        if (err) console.log(err)
        if(!user) {
            //return res.redirect("/login-error")
            //res.redirect("/home")
            return res.json({status: '0', message: "Datos incorrectos"})
        }
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) console.log(err);
            if (isMatch) {
                if (req.session.contador){
                    req.session.contador++;            
                }else {
                    req.session.contador = 1;            
                }
                req.session.expires = 60000;
                req.session.user = user.username;
                req.session.admin = true;
                //req.user = user.username;
                res.json({status: '1', message: "Bienvenido "+user.username});
                //res.redirect("/home")
            } 
        });
    });
});

app.get("/login",passport.authenticate("local", { failureRedirect: "login-error" }),
    (req, res) => {
      res.redirect("/datos");
    }
  );
  
app.get("/home", async (req, res) => {    
    if (req.user){
        const datosUsuario = await User.findById(req.user._id);
        //res.render("datos", {datos: datosUsuario});
        //res.json({"datos": datosUsuario});
        res.sendFile('./views/home.html', {root: __dirname, datosUsuario:datosUsuario});        
    }else {
        res.sendFile("./views/login-error.html", {root: __dirname});
    }
});

app.post("/getCookies", (req, res) => {
    res.json(req.session);
});

app.get("/log", (req, res) => { 
    res.sendFile('./views/login.html', {root: __dirname});
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

app.get("/registerHome", (req, res) => {   
    res.sendFile('./views/register.html', {root: __dirname});
});

app.get("/login-error", (req, res) => {   
    res.sendFile('./views/login-error.html', {root: __dirname});
});

app.get("/privado", auth, (req, res) => {
    res.send("Ok modo privado");
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

const server = app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${server.address().port}`);
});

//export default app;