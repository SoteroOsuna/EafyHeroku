const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const XLSX = require('xlsx');
const cors = require("cors");
const bcrypt = require('bcryptjs');
const Swal = require('sweetalert2');
const moment = require('moment');

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

const movimientos_Schema = new mongoose.Schema ({
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
    FechaSubida: String
});

const catalogo_Schema = new mongoose.Schema ({
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

const movimientosUsuarioSchema = new mongoose.Schema ({
    fecha: String,
    cuenta: String,
    asunto: String,
    cantidad: Number
});

// 2. crear el modelo
const Usuario = new mongoose.model("Usuario", usuarioSchema);
var mov_Model = new mongoose.model("excel_mov_Aux", movimientos_Schema, "excel_mov_Aux");
var catalogo_Model = new mongoose.model("excel_catalogo", catalogo_Schema, "excel_catalogo");
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


app.post("/subirMovimientos", upload.single('excel'), uploadMovimientos);
function uploadMovimientos(req, res) {    
    var workbook = XLSX.read(req.file.buffer);
    var sheet_name_list = workbook.SheetNames;
    var data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    var account = "";
    var fail = false;
    var count = 0;
    for (let line of data) {
        if (Object.keys(line).length >= 4 && line["CONTPAQ i"] !== undefined && line["__EMPTY"] !== "") {
            if (String(line["CONTPAQ i"]).match(/\d{3}-\d{3}/)) {
                account = line["CONTPAQ i"];
            } else {
                if (Object.keys(line).length >= 6 && line["CONTPAQ i"] !== "Fecha") {
                    
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

                    var movBaseDatos = new mov_Model ({
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
        }
    }
    if (fail != true) {
        Swal.fire(
            'Excel subido a la DB con exito :)',
            'success'
        )
        console.log("Excel subido a la DB con exito :)")
    } else {
        Swal.fire({
            icon: 'error',
            title: 'ERROR:',
            text: 'No se pudo subir a la DB el excel'
        })
    }
    res.redirect('/dashboard');
}

app.post("/subirCatalogo", upload.single('excel'), uploadCatalogo);
function uploadCatalogo(req, res) {    
    var workbook = XLSX.read(req.file.buffer);
    var sheet_name_list = workbook.SheetNames;
    var data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    
    var fail = false;
    
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
    }
    res.redirect('/dashboard');
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