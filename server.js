const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const XLSX = require('xlsx');
const cors = require("cors");
const bcrypt = require('bcryptjs');
const Swal = require('sweetalert2');
const moment = require('moment');
const { path } = require("express/lib/application");
require('dotenv').config({path:__dirname+'/environmental_variables/.env'})
const catalogo_Model = require("./backend/models/catalogo_Schema")

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
// solicitudes o declaraciones previas /////////////////

const key = process.env.KEY;
const dbuser = process.env.DBUSER;
const connection = process.env.CONNECTION;
// conectar atlas
mongoose.connect(`mongodb+srv://${dbuser}:${key}@${connection}`, {useNewUrlParser: true});

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

const movimientos_Schema = new mongoose.Schema ({
    Submission_id: Number,
    Registro: Number,
    Cuenta: String,
    Fecha: String,
    Tipo: String,
    Numero: Number,
    Concepto: String,
    Referencia: String,
    Cargos: Number,
    Abonos: Number,
    Saldo: Number,
    Total: Number,
    Total_Cargos: Number,
    Total_Abonos: Number,
    Total_Saldo: Number,
    Categoria_Total: String,
    TotalContable_Cargos: Number,
    TotalContable_Abonos: Number,
    FechaSubida: String
});
/*
const catalogo_Schema = new mongoose.Schema ({
    Submission_id: Number,
    Nivel: Number,
    Codigo: String,
    Nombre: String,
    Tipo: String,
    Fin: String,
    Moneda: String,
    NIF: Number,
    SAT: Number,
    FechaSubida: String
});
*/

const movimientosUsuarioSchema = new mongoose.Schema ({
    fecha: String,
    cuenta: String,
    asunto: String,
    cantidad: Number
});

// 2. crear el modelo
const nombre_Usuario = "Testing";
const Usuario = new mongoose.model("Usuario", usuarioSchema);
var mov_Model = new mongoose.model(`excel_mov_Aux_${nombre_Usuario}`, movimientos_Schema, `excel_mov_Aux_${nombre_Usuario}`);
//var catalogo_Model = new mongoose.model(`excel_catalogo_${nombre_Usuario}`, catalogo_Schema, `excel_catalogo_${nombre_Usuario}`);
var movimientosModel = new mongoose.model("MovimientosUsuario", movimientosUsuarioSchema);

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


// Método para validar credenciales de Login
app.post("/login", async (req, res) => {
    const {email, contraseña} = req.body
    const user = await Usuario.findOne({email})

    if(!user){
        res.status(201)
        res.send({ error: 'Usuario no encontrado' })
        return 
    }

    const checkPassword = await bcrypt.compare(contraseña, user.contraseña)

    if (checkPassword){
        res.status(200)
        res.send('Login exitoso')
        return
    }

    if(!checkPassword){
        res.status(202)
        res.send({
            error: 'Contraseña Invalida'
        })
        return
    }
});

app.get("/validateMovimientosTEST", validateMovimientosTEST);
async function validateMovimientosTEST(req, res) {
    // Create an ID for Submission
    await mov_Model.find().sort({"Submission_id":-1}).limit(1).then( (result) => {
        result.map(function(u){
            if (u.Submission_id == (undefined || null)) { result = null } else { 
                result = u.Submission_id + 1;
             }
            console.log("Result ",result)
            res.send({submit_id: result});
        })
    }).catch( (err) => {
        console.log(err);
    })
    return;
}

app.post("/subirMovimientos", upload.single('excel'), uploadMovimientos);
async function uploadMovimientos(req, res) {    
    var workbook = XLSX.read(req.file.buffer);
    var sheet_name_list = workbook.SheetNames;
    var data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    var account = "";
    var fail = false;
    var EmptyRow4 = "";
    var count = 0;
    var submit_id = 0;

    // Create an ID for Submission
    await mov_Model.find().sort({"Submission_id":-1}).limit(1).then( (result) => {
        result.map(function(u){
            if (u.Submission_id == (undefined || null)) { submit_id = 0 } else { 
                submit_id = u.Submission_id + 1;
             }
            
        })
        
        console.log("Submit_id at creation: ", submit_id);
    }).catch( (err) => {
        console.log(err);
    })

    for (let line of data) {
        if (Object.keys(line).length >= 4 && ( (line["CONTPAQ i"] !== undefined && line["__EMPTY"] !== "") || String(line["__EMPTY_2"]).includes("Total") ) ) {
            if (String(line["CONTPAQ i"]).match(/\d{3}-\d{3}/)) {
                account = line["CONTPAQ i"];
                EmptyRow4 = line["__EMPTY_4"];
            } else {
                if (line["Lecar Consultoria en TI, S.C."] == undefined  && (line["__EMPTY_3"], line["__EMPTY_4"], line["Hoja:      1"] != 0)) {
                    var VCUENTA = account;
                    cadena = String(line["__EMPTY_2"]);

                    if (cadena[5] != ":"){
                        var VCATEGORIA = (cadena.substring(6, cadena.length-2));
                    } else {
                        VCATEGORIA = "Movimiento de Cuenta Común"
                    }
                   
                    var VTOTAL_CARGOS =  line["__EMPTY_3"];
                    var VTOTAL_ABONOS =  line["__EMPTY_4"];
                    var VTOTAL_SALDO =  line["Hoja:      1"];
                    var now = new Date();
                    moment.locale('es')
                    var VFECHA_SUBIDA = moment(now).format('LL, h:mm a');
                    /*
                    console.log("Account: ", account);
                    console.log("Total A :", VTOTAL_CARGOS);
                    console.log("Total B :", VTOTAL_ABONOS);
                    console.log("Total C :", VTOTAL_SALDO, "\n");
                    */
                    console.log("Submit_id at 3 Total: ", submit_id);

                    var movBaseDatos = new mov_Model ({
                        Submission_id:          submit_id,
                        Cuenta:                 VCUENTA,
                        Categoria_Total:        VCATEGORIA,
                        Total_Cargos:           VTOTAL_CARGOS,
                        Total_Abonos:           VTOTAL_ABONOS,
                        Total_Saldo:            VTOTAL_SALDO,
                        FechaSubida:            VFECHA_SUBIDA
                    });
                    
                    movBaseDatos.save( (err,data) => {
                        if (err) {
                            console.log("Error at line " + line + " : " + err);
                            fail = true;
                        } 
                    });
                    
                    
                }
                else if (Object.keys(line).length >= 6 && line["CONTPAQ i"] !== "Fecha") {
                    
                    EmptyRow4 = line["__EMPTY_4"];

                    var VREGISTRO = ++count;
                    var VCUENTA = account;
                    var VFECHA = line["CONTPAQ i"];
                    var VTIPO = line["__EMPTY"];
                    var VNUMERO = line["__EMPTY_1"];
                    var VCONCEPTO = line["Lecar Consultoria en TI, S.C."];
                    var VREFERENCIA = line["__EMPTY_2"];
                    var VCARGOS = line["__EMPTY_3"];
                    var VABONOS = line["__EMPTY_4"];
                    var VSALDO = line["Hoja:      1"];
                    var now = new Date();
                    moment.locale('es')
                    var VFECHA_SUBIDA = moment(now).format('LL, h:mm a');
                    
                    console.log("Submit_id at Normal rows: ", submit_id);

                    var movBaseDatos = new mov_Model ({
                        Submission_id:          submit_id,
                        Registro:       VREGISTRO,
                        Cuenta:         VCUENTA,
                        Fecha:          VFECHA,
                        Tipo:           VTIPO,
                        Numero:         VNUMERO,
                        Concepto:       VCONCEPTO,
                        Referencia:     VREFERENCIA,
                        Cargos:         VCARGOS,
                        Abonos:         VABONOS,
                        Saldo:          VSALDO,
                        FechaSubida:    VFECHA_SUBIDA
                    });
                    
                    movBaseDatos.save( (err,data) => {
                        if (err) {
                            console.log("Error at line " + line + " : " + err);
                            fail = true;
                        } 
                    });
                    
                    
                }
            }
        } // 1st if
        if (line["__EMPTY_2"] == "T o t a l     C o n t a b l e: ") {
            var TotalContableC = line["__EMPTY_3"];
            var TotalContableA = line["__EMPTY_4"];
            var now = new Date();
            moment.locale('es')
            var VFECHA_SUBIDA = moment(now).format('LL, h:mm a');

            console.log("Submit_id at final totals: ", submit_id);

            var movBaseDatos = new mov_Model ({
                Submission_id:          submit_id,
                TotalContable_Cargos: TotalContableC,
                TotalContable_Abonos: TotalContableA,
                FechaSubida:    VFECHA_SUBIDA
            });
            
            movBaseDatos.save( (err,data) => {
                if (err) {
                    console.log("Error at line " + line + " : " + err);
                    fail = true;
                } 
            });
            
        }
        
    }
    
    //res.redirect('/dashboard');
    if (fail != true) {
        console.log("Excel subido a la DB con exito :)")
        res.status(201).redirect('/dashboard');
    }
    else {
        res.status(400);
    }
    
    //return res.status(200);
}

app.post("/subirCatalogo", upload.single('excel'), uploadCatalogo);
async function uploadCatalogo(req, res) {    
    var workbook = XLSX.read(req.file.buffer);
    var sheet_name_list = workbook.SheetNames;
    var data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    
    var fail = false;
    var submit_id = 0;

    // Create an ID for Submission
    await catalogo_Model.find().sort({"Submission_id":-1}).limit(1).then( (result) => {
        result.map(function(u){
            if (u.Submission_id == (undefined || null)) { submit_id = 0 } else { 
                submit_id = u.Submission_id + 1;
             }
            
        })
        
        console.log("Submit_id at creation: ", submit_id);
    }).catch( (err) => {
        console.log(err);
    })
    
    for (let line of data) {
        if (Object.keys(line).length >= 4 && line["CONTPAQ i"] !== undefined && line["__EMPTY"] !== "") {
            if (String(line["CONTPAQ i"]).match(/\d{1}/)) {
                
                var VNIVEL = line["CONTPAQ i"];
                var VCODIGO = line["__EMPTY"];
                var VNOMBRE = line["__EMPTY_1"];
                var VTIPO = line["__EMPTY_2"];
                    if (line["__EMPTY_3"] === " ") var VAFECTABLE = null;
                    else VAFECTABLE = line["__EMPTY_3"];
                // var VCONCEPTO = line["Lecar Consultoria en TI, S.C."];
                    if (line["__EMPTY_4"] === " ") var VEDO_FIN = null;
                    else VEDO_FIN = line["__EMPTY_4"];
                var VMONEDA = line["__EMPTY_5"];
                // var VSEGNEG = line["__EMPTY_6"];
                    if (line["__EMPTY_7"] === undefined) var VNIF = null;
                    else VNIF = line["__EMPTY_7"];
            
                    if (line["Hoja:      1"] === undefined) var VSAT = null;
                    else VSAT = line["Hoja:      1"];
                var now = new Date();
                moment.locale('es')
                var VFECHA_SUBIDA = moment(now).format('LL, h:mm a');
                
                var CatalogoBaseDatos = new catalogo_Model ({
                    Submission_id: submit_id,
                    Nivel: VNIVEL,
                    Codigo: VCODIGO,
                    Nombre: VNOMBRE,
                    Tipo: VTIPO,
                    Fin: VEDO_FIN,
                    Moneda: VMONEDA,
                    NIF: VNIF,
                    SAT: VSAT,
                    FechaSubida: VFECHA_SUBIDA
                });
                
                CatalogoBaseDatos.save( (err,data) => {
                    if (err) {
                        console.log("Error at line " + line + " : " + err);
                        fail = true;
                    } 
                });
                
               /*
                CatalogoBaseDatos.save()
                   .then(() => res.json("Datos subidos con exito :)"))
                   .catch((err) => res.status(400).json(`Error: ${err}`));
                */
            } /* 
            else {
                if (line["CONTPAQ i"] == "Total de cuentas:") {
                    var Total = line["__EMPTY_1"];
                    console.log("Total: " + Total)
                }
                if (line["CONTPAQ i"] == "Cuentas de acumulación:") {
                    var Acumulacion = line["__EMPTY_1"];
                    console.log("Acumulación: " + Acumulacion)
                }
                if (line["CONTPAQ i"] == "Cuentas de afectación:") {
                    var Afectacion = line["__EMPTY_1"];
                    console.log("Afectación: " + Afectacion)
                }
            } 
            */
        }
    }
    
    if (fail != true) {
        console.log("Excel subido a la DB con exito :)")
        res.status(201).redirect('/dashboard');
    }
    else {
        res.status(400);
    }
    //res.redirect('/dashboard');
}


//Método get para movimientos
app.get("/recibirMovimientos", (req, res) => {
    movimientosModel.find().then( (result) => {
        res.send(result);
    }).catch( (err) => {
        console.log(err);
    })
});
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