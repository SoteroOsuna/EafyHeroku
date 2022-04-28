const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const XLSX = require('xlsx');
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
// solicitudes o declaraciones previas /////////////////

const key = 'inshotmongodb';
// conectar atlas
mongoose.connect(`mongodb+srv://DBAdmin:${key}@clustermiapp.jwlpc.mongodb.net/EafyAppDB`, {useNewUrlParser: true});

// multer
var storage = multer.memoryStorage();

var upload = multer({ storage: storage });

//Base de datos
//1. Esquema
//const Schema = mongoose.Schema;
const usuarioSchema = {
    nombre: String,
    email: String,
    contraseña: String,
    reportesGenerados: Number
};

const excelSchema = new mongoose.Schema ({
    Item: Number,
    Description: String,
    UM: String,
    ProductCode: String
});

// 2. crear el modelo
const Usuario = new mongoose.model("Usuario", usuarioSchema);
var excelModel = new mongoose.model("Excel", excelSchema);

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
        contraseña: contraseñaFormulario,
        reportesGenerados: 0
    });

    //4. subir a la base de datos o guardar.
    usuarioBaseDatos.save();
});

/*
app.post("/subirExcel", upload.single('excel'), (req, res) => {
    var workbook = XLSX.read(req.file.buffer);
    var sheet_namelist = workbook.SheetNames;
    var x=0;
    sheet_namelist.forEach(element => {
        var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_namelist[x]]);
        excelModel.insertMany(xlData, (err,data) => {
            if (err) {
                console.log(err);
            } else {
                console.log(data);
            }
        })
        x++;
    });
    res.redirect('/');
});
*/

app.post("/subirExcel", upload.single('excel'), uploadMovimientos);
function uploadMovimientos(req, res) {    
    var workbook = XLSX.read(req.file.buffer);
    var sheet_name_list = workbook.SheetNames;
    var data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    var account = "";
    var output = "";
    var count = 0;
    for (let line of data) {
        if (Object.keys(line).length >= 4 && line["CONTPAQ i"] !== undefined && line["__EMPTY"] !== "") {
            if (String(line["CONTPAQ i"]).match(/\d{3}-\d{3}/)) {
                account = line["CONTPAQ i"];
            } else {
                if (Object.keys(line).length >= 6 && line["CONTPAQ i"] !== "Fecha") {
                    output += "REGISTRO " + (++count) + "-----------------------------\n";
                    output += "CUENTA: " + account + "\n";  
                    output += "FECHA: " + line["CONTPAQ i"] + "\n";  
                    output += "TIPO: " + line["__EMPTY"] + "\n";  
                    output += "NUMERO: " + line["__EMPTY_1"] + "\n";
                    output += "CONCEPTO: " + line["Lecar Consultoria en TI, S.C."] + "\n";
                    output += "REFERENCIA: " + line["__EMPTY_2"] + "\n";
                    output += "CARGOS: " + line["__EMPTY_3"] + "\n";
                    output += "ABONOS: " + line["__EMPTY_4"] + "\n";
                    output += "SALDO: " + line["Hoja:      1"] + "\n";  
                }
            }
        }
    }
    console.log(output);

    return res.status(201).send(output);
}

//////// 2 fragmentos necesarios para implementar heroku

// usar estáticos cuando esta en modo produccion //
if(process.env.NODE_ENV === 'production') {
    app.use(express.static('frontend/build'));
    app.get("*", (req, res) => {
        res.sendFile((__dirname + "/frontend/build/index.html"));
    })
    }
    
    
    // cambio de puerto en heroku
    let port = process.env.PORT;
    if (port == null || port == "") {
    port = 5000;
    }
////////// 2 fragmentos necesarios para implementar heroku


// react usa puerto 3000. Server debe usar otro puerto
app.listen(port, function(){
    console.log("servidor de express funcionado");
})