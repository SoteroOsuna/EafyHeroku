import React, { useEffect, useState } from "react";
import axios from "axios";
import { Helmet } from 'react-helmet';
import Select from 'react-select';
import swal from 'sweetalert';
import Pdf from "react-to-pdf";

const reference1 = React.createRef();

const Swal = require('sweetalert2');

function DescargarPDF_BG( {userEmail, userContraseña} ){

    const [reportGenerated, setReportGenerated] = useState(false);
    const [cuentasBG, setCuentasBG] = useState({});
    const [totales, setTotales] = useState([0,0,0,0,0,0,0,0]);

    var Mes_Rep1 = "ene";
    var Mes_Rep2 = "dic";

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
        console.log(userEmail, " : ", userContraseña);
        console.log(Mes_Rep1);
        console.log(Mes_Rep2);

        axios.get(`/recibir_FechasDe_Movimientos/${Mes_Rep1}/${Mes_Rep2}/${userEmail}/${userContraseña}`).then(resp => {
            const datos = resp.data;
            console.log(datos); 
            if (datos.length == 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'ERROR:',
                    text: 'No existen registros en la DB con la fecha especificada :('
                })
            }  
                
            console.log("checando datos...");
            for (let i = 0; i < datos.length; i++) {
                console.log(datos[i]);
                if (datos[i]["Categoria_Total"] != "Movimiento de Cuenta Común" &&
                    (datos[i]["Total_Cargos"] || datos[i]["Total_Abonos"] || datos[i]["Total_Saldo"]) ) {
                        if (cuentasBG[datos[i]["Categoria_Total"]] == null) {
                            if(datos[i]["Categoria_Total"].substring(0,12) == "Depreciación") {
                                setCuentasBG(cuentasBG[datos[i]["Categoria_Total"]] = -1*datos[i]["Total_Saldo"]);
                            } else {
                                setCuentasBG(cuentasBG[datos[i]["Categoria_Total"]] = datos[i]["Total_Saldo"]);
                            }
                        } else {
                            if(datos[i]["Categoria_Total"].substring(0,12) == "Depreciación") {
                                setCuentasBG(cuentasBG[datos[i]["Categoria_Total"]] += -1*datos[i]["Total_Saldo"]);
                            } else {
                                setCuentasBG(cuentasBG[datos[i]["Categoria_Total"]] += datos[i]["Total_Saldo"]);
                            }
                        }
                    let codigo = parseInt(datos[i]["Cuenta"].substring(0,3));
                    console.log(codigo);
                    if (codigo >= limitesBG["ActivoCiculante"][0] && codigo <= limitesBG["ActivoCiculante"][1]) {
                        if (!activoCirculante.includes(datos[i]["Categoria_Total"])) {
                            activoCirculante.push(datos[i]["Categoria_Total"]);
                        } 
                    } else if (codigo >= limitesBG["ActivoFijo"][0] && codigo <= limitesBG["ActivoFijo"][1]) {
                        if (!activoFijo.includes(datos[i]["Categoria_Total"])){
                            activoFijo.push(datos[i]["Categoria_Total"]);
                        }
                    } else if (codigo >= limitesBG["ActivoDiferido"][0] && codigo <= limitesBG["ActivoDiferido"][1]) {
                        if (!activoDiferido.includes(datos[i]["Categoria_Total"])) {
                            activoDiferido.push(datos[i]["Categoria_Total"]);
                        }
                    } else if (codigo >= limitesBG["PasivoCirculante"][0] && codigo <= limitesBG["PasivoCirculante"][1]) {
                        if (!pasivoCirculante.includes(datos[i]["Categoria_Total"])) {
                            pasivoCirculante.push(datos[i]["Categoria_Total"]);
                        }
                    } else if (codigo >= limitesBG["PasivoFijo"][0] && codigo <= limitesBG["PasivoFijo"][1]) {
                        if (!pasivoFijo.includes(datos[i]["Categoria_Total"])) {
                            pasivoFijo.push(datos[i]["Categoria_Total"]);
                        }
                    } else if (codigo >= limitesBG["PasivoDiferido"][0] && codigo <= limitesBG["PasivoDiferido"][1]) {
                        if (!pasivoDiferido.includes(datos[i]["Categoria_Total"])) {
                            pasivoDiferido.push(datos[i]["Categoria_Total"]);
                        }
                    } else if (codigo < 100) {
                        if (!capital.includes(datos[i]["Categoria_Total"])) {
                            capital.push(datos[i]["Categoria_Total"]);
                        }      
                    } else if (codigo >= limitesBG["Ingresos"][0] && codigo <= limitesBG["Ingresos"][1]) {
                        if (!ingresos.includes(datos[i]["Categoria_Total"])) {
                            ingresos.push(datos[i]["Categoria_Total"]);
                        }
                    } else if (codigo >= 500) {
                        if (!egresos.includes(datos[i]["Categoria_Total"])) {
                            egresos.push(datos[i]["Categoria_Total"]);
                        }
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
    };  

    const options = {
        orientation: 'portrait',
        unit: 'in',
        format: [40,13]
    };

    return(
        <div className="container micontenedor">
            <Helmet>
                <title>Descargar Balance General</title>
            </Helmet>
            <h1>Tu Balance General </h1>
            {/* <meta name="viewport" content="width=device-width, initial-scale=0.2"></meta> */}
                    <div className="col-md-auto align-items-center text-center">
                    
                    <h5>¿No es correcto? Pulsa "Actualizar Balance General"</h5>
                    </div>
                    {/* generarReporteBG() */}
                    <h4>Mes Inicial: </h4>
                    <div className="col-md-auto">
                        <Select name="mes1" required 
                            options = {meses}
                            onChange = {handleSelect_Mes_Rep1}
                        />
                            
                    </div>
                    <h4>Mes Final: </h4>
                    <div className="col-md-auto">
                        <Select name="mes2" required 
                            options = {meses}
                            onChange = {handleSelect_Mes_Rep2}
                        />
                            
                    </div>
        
                    {/*Boton balance general*/}
                    <div className="col-md-auto align-items-center text-center">
                        <a href="#myModal" className="btn btn-primary btn-lg btn-costum-size" role="button" onClick={() => generarReporteBG()}>Actualizar Balance General</a>

                        {/*
                        Modalidad balance general generada al presionar el boton
                        */}

                        <div id="reference1" ref={reference1} className="responsive-font">
                            <div id="myModal" className=" " content="width=device-width, initial-scale=0.2">
                                <div className="modal-dialog modal-xl" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="exampleModalLongTitle">Balance General</h5>
                                            
                                            <Pdf targetRef={reference1} filename="Balance General.pdf" options={options} x={1} y={1} scale={1}>
                                                {({ toPdf }) => <button className="btn btn-primary" onClick={toPdf}>Descargar PDF "Balance General"<i class="far fa-file-pdf ml-1 text-white"></i></button>}
                                            </Pdf>
                                        
                                            {/* <button type="button" className="btn-close" data-bs-dismiss="modal">HOLA</button> */}
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

                                                        <table id="tabla-suma-capital">

                                                        </table>
                                                        
                                                
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
                                        {/*
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal">OK</button>
                                        </div>
                                        */}
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ div>
        </div>
    );
}

export default DescargarPDF_BG;