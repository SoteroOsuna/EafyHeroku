const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
// solicitudes o declaraciones previas /////////////////

const key = 'inshotmongodb';
// conectar atlas
mongoose.connect(`mongodb+srv://DBAdmin:${key}@clustermiapp.jwlpc.mongodb.net/EafyAppDB`, {useNewUrlParser: true});

//Base de datos
//1. Esquema
//const Schema = mongoose.Schema;
const usuarioSchema = {
    nombre: String,
    email: String,
    contraseña: String
};

// 2. crear el modelo
const Usuario = new mongoose.model("Usuario", usuarioSchema);

//Método post
app.post("/registrar", function (req, res){
    // guardar variables
    const usuarioFormulario = req.body.nombre;
    const emailFormulario = req.body.email;
    const contraseñaFormulario = req.body.contraseña;

    // 3. Crear documento
    const usuarioBaseDatos = new Usuario ({
        nombre: usuarioFormulario,
        email: emailFormulario,
        contraseña: contraseñaFormulario
    });

    //4. subir a la base de datos o guardar.
    usuarioBaseDatos.save();
});


// react usa puerto 3000. Server debe usar otro puerto
app.listen(5000, function(){
    console.log("servidor de express funcionado");
})