import React, { useEffect, useState } from "react";
import Select from 'react-select';
import axios from "axios";
import swal from 'sweetalert';
import {Table} from 'reactstrap';
import Pdf from "react-to-pdf";
//import { jsPDF } from "jspdf";
import jsPDF from 'jspdf'


const reference1 = React.createRef();
const reference2 = React.createRef();
const reference3 = React.createRef();

const Swal = require('sweetalert2');

function Dashboard(){

    const [reportGenerated, setReportGenerated] = useState(false);
    const [cuentasBG, setCuentasBG] = useState({});
    const [totales, setTotales] = useState([0,0,0,0,0,0,0,0]);

    var Mes_Rep1 = "";
    var Mes_Rep2 = "";

    var cuentas = {};
    var limitesBG = {
        "ActivoCiculante": [100, 119],
        "ActivoFijo": [120, 139],
        "ActivoDiferido": [140,199],
        "PasivoCirculante": [200, 219],
        "PasivoFijo": [220,229],
        "PasivoDiferido": [230, 399],
        "Ingresos": [400, 499],
    }
    var activoCirculante = [];
    //"Bancos", "Clientes", "Deudores Diversos", "IVA Acreditable"
    var activoFijo = [];
    //"Mobiliario y Equipo de oficina", "Depreciación Acumulada de Mob y Eq. oficina"
    var activoDiferido = [];
    //"Impuestos Anticipados"
    var pasivoCirculante = [];
    //"ACREEDORES DIVERSOS", "IMPUESTOS POR PAGAR", "DOCUMENTOS POR PAGAR"
    var pasivoFijo = [];
    var pasivoDiferido = [];
    var capital = [];
    var ingresos = [];
    var egresos = [];
    //"Capital Social", "Resultado Ejercicios Anteriores"

    const llenarTablaRBG = (tablaID, categoria, textoTotal, indice) => {
        var ACTable = document.getElementById(tablaID);
                for (let i = 0; i < categoria.length; i++) {
                    console.log("añadiendo fila: ", categoria[i]);
                    if (cuentasBG[categoria[i]] != null && cuentasBG[categoria[i]] != 0) {
                        var row = ACTable.insertRow(ACTable.rows.length);
                        var cell0 = row.insertCell(0);
                        cell0.innerHTML = categoria[i];

                        var cell1 = row.insertCell(1);
                        var element = document.createElement("p");
                        //element.className = "cantidad";
                        element.innerHTML = cuentasBG[categoria[i]];
                        cell1.appendChild(element);

                    }
                }
                var row = ACTable.insertRow(ACTable.rows.length);
                var cell0 = row.insertCell(0);

                var cell1 = row.insertCell(1);
                var element = document.createElement("hr");
                cell1.appendChild(element);

                row = ACTable.insertRow(ACTable.rows.length);
                cell0 = row.insertCell(0);
                element = document.createElement("p");
                element.innerHTML = textoTotal;
                cell0.appendChild(element);

                cell1 = row.insertCell(1);
                element = document.createElement("p");
                element.innerHTML = totales[indice];
                cell1.appendChild(element);
    }
    const sumarTotal = (tablaID, textoTotal) => {
        console.log("probando con tabla: ", tablaID);
        console.log("totales de:", totales);
        var tablaSuma = document.getElementById(tablaID);
        var row = tablaSuma.insertRow(tablaSuma.rows.length);
        var cell0 = row.insertCell(0);
        var cell1 = row.insertCell(1);
        var element = document.createElement("hr");
        cell1.appendChild(element);

        if (textoTotal == "SUMA DEL ACTIVO") {
            row = tablaSuma.insertRow(tablaSuma.rows.length)
            cell0 = row.insertCell(0);
            element = document.createElement("p");
            element.innerHTML = textoTotal;
            cell0.appendChild(element);

            cell1 = row.insertCell(1);
            element = document.createElement("p");
            element.innerHTML = (totales[0] + totales[1] + totales [2]).toFixed(2);
            cell1.appendChild(element);
        } else if (textoTotal == "SUMA DEL PASIVO") {
            row = tablaSuma.insertRow(tablaSuma.rows.length)
            cell0 = row.insertCell(0);
            element = document.createElement("p");
            element.innerHTML = textoTotal;
            cell0.appendChild(element);

            cell1 = row.insertCell(1);
            element = document.createElement("p");
            element.innerHTML = (totales[3] + totales[4] + totales [5]).toFixed(2);
            cell1.appendChild(element);
        } else if (textoTotal == "SUMA DEL CAPITAL") {
            row = tablaSuma.insertRow(tablaSuma.rows.length)
            cell0 = row.insertCell(0);
            element = document.createElement("p");
            element.innerHTML = textoTotal;
            cell0.appendChild(element);

            cell1 = row.insertCell(1);
            element = document.createElement("p");
            element.innerHTML = (totales[6] + totales[7]).toFixed(2);
            cell1.appendChild(element);
        } else {
            row = tablaSuma.insertRow(tablaSuma.rows.length)
            cell0 = row.insertCell(0);
            element = document.createElement("p");
            element.innerHTML = textoTotal;
            cell0.appendChild(element);

            cell1 = row.insertCell(1);
            element = document.createElement("p");
            element.innerHTML = (totales[3] + totales[4] + totales[5] + totales[6] + totales[7]).toFixed(2);
            cell1.appendChild(element);
        }
    }

    const generarReporteBG = () => {
    console.log(reportGenerated);
        if (!reportGenerated) {
            axios.get('/recibirMovimientos').then(resp => {
                const datos = resp.data;
                console.log("checando datos...");
                for (let i = 0; i < datos.length; i++) {
                    if (datos[i]["Categoria_Total"] != "Movimiento de Cuenta Común" &&
                        (datos[i]["Total_Cargos"] || datos[i]["Total_Abonos"] || datos[i]["Total_Saldo"]) ) {
                            if(datos[i]["Categoria_Total"].substring(0,12) == "Depreciación") {
                                setCuentasBG(cuentasBG[datos[i]["Categoria_Total"]] = -1*datos[i]["Total_Saldo"]);
                            } else {
                                setCuentasBG(cuentasBG[datos[i]["Categoria_Total"]] = datos[i]["Total_Saldo"]);
                            }
                        let codigo = parseInt(datos[i]["Cuenta"].substring(0,3));
                        console.log(codigo);
                        if (codigo >= limitesBG["ActivoCiculante"][0] && codigo <= limitesBG["ActivoCiculante"][1]) {
                            activoCirculante.push(datos[i]["Categoria_Total"]);
                        } else if (codigo >= limitesBG["ActivoFijo"][0] && codigo <= limitesBG["ActivoFijo"][1]) {
                            activoFijo.push(datos[i]["Categoria_Total"]);
                        } else if (codigo >= limitesBG["ActivoDiferido"][0] && codigo <= limitesBG["ActivoDiferido"][1]) {
                            activoDiferido.push(datos[i]["Categoria_Total"]);
                        } else if (codigo >= limitesBG["PasivoCirculante"][0] && codigo <= limitesBG["PasivoCirculante"][1]) {
                            pasivoCirculante.push(datos[i]["Categoria_Total"]);
                        } else if (codigo >= limitesBG["PasivoFijo"][0] && codigo <= limitesBG["PasivoFijo"][1]) {
                            pasivoFijo.push(datos[i]["Categoria_Total"]);
                        } else if (codigo >= limitesBG["PasivoDiferido"][0] && codigo <= limitesBG["PasivoDiferido"][1]) {
                            pasivoDiferido.push(datos[i]["Categoria_Total"]);
                        } else if (codigo < 100) {
                            capital.push(datos[i]["Categoria_Total"]);
                        } else if (codigo >= limitesBG["Ingresos"][0] && codigo <= limitesBG["Ingresos"][1]) {
                            ingresos.push(datos[i]["Categoria_Total"]);
                        } else if (codigo >= 500) {
                            egresos.push(datos[i]["Categoria_Total"]);
                        }
                    }
                }
                console.log("datos checados");
                for (const activoC of activoCirculante) {
                    setTotales(totales[0] += cuentasBG[activoC]);
                }
                for (const activoF of activoFijo) {
                    setTotales(totales[1] += cuentasBG[activoF]);
                }
                for (const activoD of activoDiferido) {
                    setTotales(totales[2] += cuentasBG[activoD]);
                }
                for (const pasivoC of pasivoCirculante) {
                    setTotales(totales[3] += cuentasBG[pasivoC]);
                }
                for (const pasivoF of pasivoFijo) {
                    setTotales(totales[4] += cuentasBG[pasivoF]);
                }
                for (const pasivoD of pasivoDiferido) {
                    setTotales(totales[5] += cuentasBG[pasivoD]);
                }
                for (const c of capital) {
                    setTotales(totales[6] += cuentasBG[c]);
                }
                for (const i of ingresos) {
                    setTotales(totales[7] += cuentasBG[i]);
                }
                for (const e of egresos) {
                    setTotales(totales[7] -= cuentasBG[e]);
                }

                console.log(cuentasBG);
                console.log(totales);
                setCuentasBG(cuentas);
                console.log(activoCirculante);
                console.log(capital);
                console.log(ingresos);
                console.log(egresos);
                llenarTablaRBG("tabla-activos-circulante", activoCirculante, "Total CIRCULANTE", 0);
                llenarTablaRBG("tabla-activos-fijo", activoFijo, "Total FIJO", 1);
                llenarTablaRBG("tabla-activos-diferido", activoDiferido, "Total DIFERIDO", 2);
                llenarTablaRBG("tabla-pasivos-circulante", pasivoCirculante, "Total CIRCULANTE", 3);
                llenarTablaRBG("tabla-pasivos-fijo", pasivoFijo, "Total FIJO", 4);
                llenarTablaRBG("tabla-pasivos-diferido", pasivoDiferido, "Total DIFERIDO", 5);
                llenarTablaRBG("tabla-capital", capital, "Total CAPITAL", 6);
                sumarTotal("tabla-suma-activos", "SUMA DEL ACTIVO");
                sumarTotal("tabla-suma-pasivos", "SUMA DEL PASIVO");
                sumarTotal("tabla-suma-capital", "SUMA DEL CAPITAL");
                sumarTotal("tabla-suma-pc", "SUMA DEL PASIVO Y CAPITAL");

                var tablaC = document.getElementById("tabla-capital");
                var row = tablaC.insertRow(tablaC.rows.length);
                var cell0 = row.insertCell(0);
                var element = document.createElement("p");
                element.innerHTML = "Utilidad o Pérdida del Ejercicio";
                cell0.appendChild(element);

                var cell1 = row.insertCell(1);
                element = document.createElement("p");
                element.innerHTML = totales[7].toFixed(2);
                cell1.appendChild(element);

                
                
                
                setReportGenerated(current => !current);
            });
        }
    };

    var prev_result = null;
    var result = null;
    var valid = false;

    function mostrarAlerta() {
        // Obtener nombre de archivo
        let archivo = document.getElementById('excel-file').value,
        // Obtener extensión del archivo
            extension = archivo.substring(archivo.lastIndexOf('.'),archivo.length);
        // Si la extensión obtenida no está incluida en la lista de valores
        // del atributo "accept", mostrar un error.
        if(document.getElementById('excel-file').getAttribute('accept').split(',').indexOf(extension) < 0) {
            swal("Archivo inválido", "No se permite la extensión " + extension);
        }
        else {
            valid = true;
        }
    }

    function alertaPOST() {
        if (valid == true) {
            swal("Ya casi", "A continuación tus datos se mandaran a la DB");
            valid = false;
        } else {
            swal("Ingresa un archivo Excel(.xlsx)")
        }
    }
     
    async function validateMov(){
        const result = await axios.get("/validateMovimientosTEST");
        const status = result.status
        console.log("Pase por validateMov");
        console.log(status);

        if (status===200){
            Swal.fire(
                'Tu información se ha mandado a la DB :)',
                'success'
            )
            
        }
        else {
            Swal.fire({
                icon: 'error',
                title: 'ERROR:',
                text: 'Los datos no se enviaron :('
            })
        }
    }

    function handleClick(event){
        // evita el parpadeo predefinido
        event.preventDefault();
        const excelMov = document.getElementById("excel-file").files;
        console.log(excelMov);
        
        console.log("Pase por handleClick");
        validateMov()
    }

    let formData = new FormData();
    

    const onFileChange = async (e) => {
        console.log(e.target.files[0])
        console.log(document.querySelector('#excel-file').files[0])
        if (e.target && e.target.files[0]);
        formData.append('excel', e.target.files[0]);
        mostrarAlerta();
        prev_result = await axios.get("/validateMovimientosTEST");
        console.log(prev_result);
        prev_result = prev_result.data.submit_id;
        console.log("Prev Result: ", prev_result);
        //console.log({formData})
    } 

    const clickFunc = (event) => {
        setTimeout(validate_Mov, 3000);
    }

    const validate_Mov = async (event) => {
        result = await axios.get("/validateMovimientosTEST");
        console.log(result);
        result = result.data.submit_id;
        console.log("Result: ", result);

        if (prev_result + 1 === result){
            Swal.fire(
                'Tu información se ha mandado a la DB :)',
                'success'
            )
            
        }
        else {
            Swal.fire({
                icon: 'error',
                title: 'ERROR:',
                text: 'Los datos no se enviaron :('
            })
        }
        
    }

    const meses = [
        { label: 'Enero',       value: 'ene' },
        { label: 'Febrero',     value: 'feb'},
        { label: 'Marzo',       value: 'mar' },
        { label: 'Abril',       value: 'abr' },
        { label: 'Mayo',        value: 'may ' },
        { label: 'Junio',       value: 'jun' },
        { label: 'Julio',       value: 'jul' },
        { label: 'Agosto',      value: 'ago' },
        { label: 'Septiembre',  value: 'sep'},
        { label: 'Octubre',     value: 'oct' },
        { label: 'Noviembre',   value: 'nov'},
        { label: 'Diciembre',   value: 'dic'}
    ]

    const handleSelect_Mes_Rep1 = (event) => {
        Mes_Rep1 = event.value;
        console.log(Mes_Rep1);
    }

    const handleSelect_Mes_Rep2 = (event) => {
        Mes_Rep2 = event.value;
        console.log(Mes_Rep2);
    }
    
    const buscarFechasBG = () => {  
        console.log(Mes_Rep1);
        console.log(Mes_Rep2);

        axios.get(`/recibir_FechasDe_Movimientos/${Mes_Rep1}/${Mes_Rep2}`).then(resp => {
            const datos = resp.data;
            console.log(datos); 
            if (datos.length == 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'ERROR:',
                    text: 'No existen registros en la DB con la fecha especificada :('
                })
            }  
            for (let i=0; i< datos.length; i++) {
                console.log(datos[i]["Fecha"]);
            }     
        });        
    };

    function generatePDF() {
 
        var doc = new jsPDF();
   
        document.getElementById("reference1").removeAttribute('hidden')
        document.getElementById("result2").removeAttribute('hidden')
   
        doc.fromHTML(document.getElementById("reference1"),5,5)
        doc.fromHTML(document.getElementById("result2"),5,45)
   
        document.getElementById("reference1").setAttribute('hidden', 'true')
        document.getElementById("result2").setAttribute('hidden', 'true')
   
        doc.save("output.pdf")
    }

    return(
        
        
        
        <div className="container micontenedor">
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
            <script src="https://parall.ax/parallax/js/jspdf.js"></script>

                <h1>Dashboard</h1>
                <div className="container">
                    <div className="row justify-content-around">
                        <div className="col">
                            <div className="row align-items-center">
                                <h1 className="text-center"> Registro de Archivos</h1>
                            {/*}
                            </div>
                            <div className="row justify-content-center">
                            */}
                                <div className="col-md-auto">
                                     <form action="/subirMovimientos" method="POST" enctype="multipart/form-data"> 
                                    
                                        <div className="form-group">
                                            <label for="excel">Movimientos Auxiliares del Catálogo</label>
                                            <input id="excel-file" accept=".xlsx" type="file" className="form-control" name="excel" onChange={onFileChange} required></input>
                                            <div className="row justify-content-center">
                                                <div className="col-md-auto">
                                                    {/* //onClick={clickFunc} */}
                                                    <button className="btn btn-dark btn-lg" type="submit" onClick={alertaPOST}>
                                                        Subir Excel (Movimientos Auxiliares del Catálogo) </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>

                                    <form action="/subirCatalogo" method="POST" encType="multipart/form-data">
                                        <div className="form-group">
                                            <label for="excel">Catálogo de Cuentas</label>
                                            <input type="file" className="form-control" name="excel" onChange={onFileChange} required></input>
                                            <div className="row justify-content-center">
                                                <div className="col-md-auto">
                                                    <button className="btn btn-dark btn-lg" type="submit" onClick={alertaPOST}>Subir Excel (Catálogo de Cuentas)</button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                    
                                </div>
                            </div>

                        </div>
                        <div className="col">
                            <div className="row justify-content-center">

                                    

                                <div className="col-md-auto">

                                    <div className="col-md-auto">
                                        <Select name="mes1" required 
                                            options = {meses}
                                            onChange = {handleSelect_Mes_Rep1}
                                        />
                                            
                                    </div>

                                    <div className="col-md-auto">
                                        <Select name="mes2" required 
                                            options = {meses}
                                            onChange = {handleSelect_Mes_Rep2}
                                        />
                                            
                                    </div>
                                  
                                    {/* <a href="#myModal" className="btn btn-dark btn-lg" data-bs-toggle="modal" role="button" onClick={() => generarReporteBG()} >Generar Balance General</a> */}
                                    <a href="#myModal" className="btn btn-dark btn-lg" data-bs-toggle="modal" role="button" onClick={() => buscarFechasBG()} >Generar Balance General</a>

                                    
                                    <div className="modal-footer">
                                        <Pdf targetRef={reference1} filename="R1.pdf">
                                            {({ toPdf }) => <button className="btn btn-primary" onClick={toPdf}>Descargar PDF TABLES</button>}
                                        </Pdf>
                                    </div>

                                    {/*
                                    <div className="modal-footer">
                                        <Pdf targetRef={reference2} filename="R2.pdf">
                                            {({ toPdf }) => <button className="btn btn-primary" onClick={toPdf}>Descargar PDF "Estado de Resultados"</button>}
                                        </Pdf>
                                    </div>

                                    <div className="modal-footer">
                                        <Pdf targetRef={reference3} filename="R3.pdf">
                                            {({ toPdf }) => <button className="btn btn-primary" onClick={toPdf}>Descargar PDF "Balance de Comprobación"</button>}
                                        </Pdf>
                                    </div>
                                    */}

                                    <div className="modal-footer">
                                        <button className="btn btn-primary" onClick={generatePDF}>Descargar PDF "Balance General"</button>
                                    </div>

                                    <div className="modal-footer">
                                        <button className="btn btn-primary" onClick={generatePDF}>Descargar PDF "Balance General 2"</button>
                                    </div>

                                    <div className="modal-footer">
                                        <button className="btn btn-primary" onClick={generatePDF}>Descargar PDF "Balance General 3"</button>
                                    </div>

                                
                                    <div id="result" hidden style={{color: "red" }}>
                                        <h1>Hello World</h1>
                                    </div>
                                    <div id="result2" hidden style={{color: "red" }}>
                                        <h1>Hello World</h1>
                                    </div>
                                        
    


                                </div>
                                {/*
                                Modalidad generada al presionar el boton
                                */}

                                <div id="reference1" ref={reference1} >
                                    <div id="myModal" >
                                        <div className="modal-dialog modal-xl" role="document">
                                            <div className="modal-content">
                                                    <div className="modal-header">
                                                        <h5 className="modal-title" id="exampleModalLongTitle">Balance General</h5>
                                                        <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                                                    </div>
                                                    <div className="modal-body">
                                                        <h1> Empresa 1</h1>
                                                        <section className ="flex-container">
                                                            
                                                            <div className="activos">
                                                                <h1 className="titulo-seccion"> Activos </h1>
                                                                <h2 className="subtitulo-seccion"> CIRCULANTE</h2>
                                                                <table id="tabla-activos-circulante">
                                                                    
                                                                </table>
                                                                <h2 className="subtitulo-seccion"> FIJO</h2>
                                                                <table id="tabla-activos-fijo">
                                                                    
                                                                </table>
                                                                <h2 className="subtitulo-seccion"> DIFERIDO</h2>
                                                                <table id="tabla-activos-diferido">
                                                                
                                                                </table>
                                                                
                                                            </div>
                                                            <div className="pasivos-capital">
                                                                <div className="pasivos">
                                                                    <h1 className="titulo-seccion"> Pasivos</h1>
                                                                    <h2 className="subtitulo-seccion">CIRCULANTE</h2>
                                                                    <table id="tabla-pasivos-circulante">
                                                                        
                                                                    </table>
                                                                    <h2 className="subtitulo-seccion"> FIJO</h2>
                                                                    <table id="tabla-pasivos-fijo">
                                                                        
                                                                    </table>
                                                                    <h2 className="subtitulo-seccion"> DIFERIDO</h2>
                                                                    <table id="tabla-pasivos-diferido">
                                                                        
                                                                    </table>
                                                                    <table id="tabla-suma-pasivos">

                                                                    </table>
                                                                </div>
                                                                <div className="capital">
                                                                    <h1 className="titulo-seccion">Capital</h1>
                                                                    <h2 className="subtitulo-seccion"> CAPITAL </h2>
                                                                    <table id="tabla-capital">
                                                                    
                                                                    </table>

                                                                    <tabla id="tabla-suma-capital">

                                                                    </tabla>
                                                                    
                                                            
                                                                </div>
                                                            </div>
                                                        </section>
                                                        <section className="flex-container">
                                                            <div className="sumas">
                                                                <table id="tabla-suma-activos">
                                                                    
                                                                </table>
                                                            </div>
                                                            <div className="sumas">
                                                                <table id="tabla-suma-pc">
                                                                    
                                                                </table>
                                                            </div>
                                                        </section>
                                                    </div>
                                                    <div className="modal-footer">
                                                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal">OK</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ div>
                            
                            <div className="row justify-content-center">
                                <div className="col-md-auto">
                                <a href="#myModal1" className="btn btn-dark btn-lg" data-bs-toggle="modal" role="button">Generar Estado de Resultados</a>
                                
                                <div id="myModal1" ref={reference2} className="modal fade">
                                    
                                        <div className="modal-dialog modal-xl" role="document">
                                            <div className="modal-content">
                                                <div className="modal-header">
                                                    <h5 className="modal-title" id="exampleModalLongTitle">Estado de Resultados</h5>
                                                    <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                                                </div>
                                                <div className="modal-body">
                                                    <section className ="flex-container">
                                                        <table className="table-responsive table-borderless">
                                                            <thead>
                                                                <th scope="col"></th>
                                                                <th className="tituloCentro" scope="col">Periodo</th>
                                                                <th className="tituloCentro" scope="col">%</th>
                                                                <th className="tituloCentro" scope="col">Acomulado</th>
                                                                <th className="tituloCentro" scope="col">%</th>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <th scope="row">I&nbsp;n&nbsp;g&nbsp;r&nbsp;e&nbsp;s&nbsp;o&nbsp;s</th>
                                                                </tr>
                                                                <tr>
                                                                    <td scope="row">Servicios</td>
                                                                    <td className="cantidad">187,725.94</td>
                                                                    <td className="porcentaje">100.00</td>
                                                                    <td className="cantidad"> 1,578,932.85</td>
                                                                    <td className="porcentaje">100.00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td scope="row"></td>
                                                                    <td><hr></hr> </td>
                                                                    <td></td>
                                                                    <td><hr></hr></td>
                                                                    <td></td>
                                                                </tr>
                                                                <tr>
                                                                    <th scope="row">Total Ingesos</th>
                                                                    <td className="cantidad">187,725.94</td>
                                                                    <td className="porcentaje">100.00</td>
                                                                    <td className="cantidad">1,578,932.85</td>
                                                                    <td className="porcentaje">100.00</td>
                                                                </tr>
                                                                <tr>
                                                                    <th scope="row">E&nbsp;g&nbsp;r&nbsp;e&nbsp;s&nbsp;o&nbsp;s</th>
                                                                </tr>
                                                                <tr>
                                                                    <td scope="row">GASTOS DE SERVICIO</td>
                                                                </tr>
                                                                <tr>
                                                                    <td scope="row">Servicio de Operacion</td>
                                                                    <td className="cantidad">57,897.22 </td>
                                                                    <td className="porcentaje">30.84</td>
                                                                    <td className="cantidad">358,346.14 </td>
                                                                    <td className="porcentaje">22.70</td>
                                                                </tr>
                                                                <tr>
                                                                    <td scope="row"></td>
                                                                    <td><hr></hr> </td>
                                                                    <td></td>
                                                                    <td><hr></hr></td>
                                                                    <td></td>
                                                                </tr>
                                                                <tr>
                                                                    <td scope="row">Total GASTOS DE SERVICIO</td>
                                                                    <td className="cantidad">57,897.22 </td>
                                                                    <td className="porcentaje">30.84</td>
                                                                    <td className="cantidad">358,346.14 </td>
                                                                    <td className="porcentaje">22.70</td>
                                                                </tr>
                                                                <tr>
                                                                    <td scope="row">GASTOS FINANCIEROS</td>
                                                                    <td className="cantidad">1,181.94 </td>
                                                                    <td className="porcentaje">0.63</td>
                                                                    <td className="cantidad">8,964.76 </td>
                                                                    <td className="porcentaje">0.57</td>
                                                                </tr>
                                                                <tr>
                                                                    <td scope="row"><i> &nbsp;GASTOS ADMINISTRATIVOS</i></td>
                                                                </tr>
                                                                <tr>
                                                                    <td scope="row">Mant de Eq de Transporte</td>
                                                                    <td className="cantidad">4,241.46  </td>
                                                                    <td className="porcentaje">2.26</td>
                                                                    <td className="cantidad">11,022.04</td>
                                                                    <td className="porcentaje">0.70</td>
                                                                </tr>
                                                                <tr>
                                                                    <td scope="row">Arrendamineto</td>
                                                                    <td className="cantidad">4,720.29  </td>
                                                                    <td className="porcentaje">2.51</td>
                                                                    <td className="cantidad">28,321.70</td>
                                                                    <td className="porcentaje">1.79</td>
                                                                </tr>
                                                                <tr>
                                                                    <td scope="row">Primas de seguro</td>
                                                                    <td className="cantidad">4,591.01</td>
                                                                    <td className="porcentaje">2.45</td>
                                                                    <td className="cantidad">20,853.83</td>
                                                                    <td className="porcentaje">1.32</td>
                                                                </tr>
                                                                <tr>
                                                                    <td scope="row">Luz</td>
                                                                    <td className="cantidad">5,047.07</td>
                                                                    <td className="porcentaje">2.69</td>
                                                                    <td className="cantidad">10,103.32 </td>
                                                                    <td className="porcentaje">0.64</td>
                                                                </tr>
                                                                <tr>
                                                                    <td scope="row">Papeleria y Utiles</td>
                                                                    <td className="cantidad">499.48</td>
                                                                    <td className="porcentaje">0.27</td>
                                                                    <td className="cantidad">3732.11</td>
                                                                    <td className="porcentaje">0.24</td>
                                                                </tr>

                                                            </tbody>
                                                        </table>
                                                    </section>
                                                </div>
                                                <div className="modal-footer">
                                                    <button type="button" className="btn btn-primary" data-bs-dismiss="modal">OK</button>
                                                </div>
                                            </div>
                                        </div>  
                                     
                                </div>
                            </div>
                            <div className="row justify-content-center">
                                <div className="col-md-auto">
                                <a href="#myModal2" className="btn btn-dark btn-lg" data-bs-toggle="modal" role="button">Generar Balance de comprobacion</a>
                                
                                <div id="myModal2" ref={reference3} className="modal fade">
                                    <div className="modal-dialog modal-xl" role="document">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title" id="exampleModalLongTitle">Balance de Comprobación</h5>
                                                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                                            </div>
                                            <div className="modal-body">
                                                <section className ="flex-container">
                                                    <table className="table-responsive table-borderless">
                                                        <thead>
                                                            <tr>
                                                            <th scope="col">C&nbsp;u&nbsp;e&nbsp;n&nbsp;t&nbsp;a</th>
                                                            <th scope="col">N&nbsp;o&nbsp;m&nbsp;b&nbsp;r&nbsp;e</th>
                                                            <th scope="col">Saldos Iniciales</th>
                                                            <th scope="col"></th>
                                                            <th scope="col"></th>
                                                            <th scope="col">Saldos Actuales</th>
                                                            </tr>
                                                            <tr>
                                                            <th scope="col"></th>
                                                            <th scope="col"></th>
                                                            <th scope="col">Deudor Acreedor</th>
                                                            <th scope="col">Cargos</th>
                                                            <th scope="col">Abonos</th>
                                                            <th scope="col">Deudor Acreedor</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <th scope="row"><hr></hr></th>
                                                                <th><hr></hr></th>
                                                                <th><hr></hr></th>
                                                                <th><hr></hr></th>
                                                                <th><hr></hr></th>
                                                                <th><hr></hr></th>
                                                            </tr>
                                                            <tr>
                                                                <td scope="row">000-0100</td>
                                                                <td>ACTIVO</td>
                                                                <td>433,048.96 </td>
                                                                <td>564,886.42</td>
                                                                <td>650,477.82</td>
                                                                <td>347,457.56 </td>
                                                            </tr>
                                                            <tr>
                                                                <td scope="row">000-0110</td>
                                                                <td>CIRCULANTE</td>
                                                                <td>433,048.96 </td>
                                                                <td>564,886.42</td>
                                                                <td>650,477.82</td>
                                                                <td>347,457.56 </td>
                                                            </tr>
                                                            <tr>
                                                                <th scope="row">100-0000</th>
                                                                <th>Fondo Fijo Caja</th>
                                                                <th>0.00 </th>
                                                                <th>0.00 </th>
                                                                <th>0.00 </th>
                                                                <th>0.00 </th>
                                                            </tr>
                                                            <tr>
                                                                <th scope="row">101-0000</th>
                                                                <th>Caja</th>
                                                                <th>0.00 </th>
                                                                <th>0.00 </th>
                                                                <th>0.00 </th>
                                                                <th>0.00 </th>
                                                            </tr>
                                                            <tr>
                                                                <th scope="row">102-0000</th>
                                                                <th>Bancos</th>
                                                                <th>13,084.95</th>
                                                                <th>305,064.14</th>
                                                                <th>311,967.68</th>
                                                                <th>36,181.41 </th>
                                                            </tr>
                                                            <tr>
                                                                <td scope="row">102-1000</td>
                                                                <td>Scotiabank</td>
                                                                <td>2,611.97</td>
                                                                <td>295,913.14</td>
                                                                <td>294,752.83</td>
                                                                <td>3,772.28</td>
                                                            </tr>
                                                            <tr>
                                                                <td scope="row">102-1000</td>
                                                                <td>Inbursa</td>
                                                                <td>10,472.98</td>
                                                                <td>9,151.00</td>
                                                                <td>17,214.85</td>
                                                                <td>2,409.13</td>
                                                            </tr>
                                                            <tr>
                                                                <td scope="row">102-1000</td>
                                                                <td>Scotiabank-CANIETI</td>
                                                                <td>0.00</td>
                                                                <td>0.00</td>
                                                                <td>0.00</td>
                                                                <td>0.00</td>
                                                            </tr>
                                                            <tr>
                                                                <td scope="row">102-1000</td>
                                                                <td>Banorte</td>
                                                                <td>0.00</td>
                                                                <td>0.00</td>
                                                                <td>0.00</td>
                                                                <td>0.00</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </section>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-primary" data-bs-dismiss="modal">OK</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>        
        </div>
    </div>
    );
}

export default Dashboard;