import React, { useEffect, useState, setState } from "react";
import axios from "axios";

function Dashboard(){

    const [reportGenerated, setReportGenerated] = useState(false);
    const [cuentasBG, setCuentasBG] = useState({});
    const [totales, setTotales] = useState([0,0,0,0,0,0,0,0]);

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
    

    return(
        <div className="container micontenedor">
                <h1>Dashboard</h1>
                <div class="container">
                    <div class="row justify-content-around">
                        <div class="col">
                            <div class="row align-items-center">
                                <h1 class="text-center"> Registro de Archivos</h1>
                            {/*}
                            </div>
                            <div class="row justify-content-center">
                            */}
                                <div class="col-md-auto">
                                    <form action="/subirMovimientos" method="POST" enctype="multipart/form-data">
                                        <div class="form-group">
                                            <label for="excel">Movimientos Auxiliares del Catálogo</label>
                                            <input type="file" class="form-control" name="excel" required></input>
                                            <div class="row justify-content-center">
                                                <div class="col-md-auto">
                                                    <input class="btn btn-dark btn-lg" type="submit" value="Subir Excel (Movimientos Auxiliares del Catálogo)"></input>
                                                </div>
                                            </div>
                                        </div>
                                    </form>

                                    <form action="/subirCatalogo" method="POST" enctype="multipart/form-data">
                                        <div class="form-group">
                                            <label for="excel">Catálogo de Cuentas</label>
                                            <input type="file" class="form-control" name="excel" required></input>
                                            <div class="row justify-content-center">
                                                <div class="col-md-auto">
                                                    <input class="btn btn-dark btn-lg" type="submit" value="Subir Excel (Catálogo de Cuentas)"></input>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                    
                                </div>
                            </div>

                        </div>
                        <div class="col">
                            <div class="row justify-content-center">
                                <div class="col-md-auto">
                                    <a href="#myModal" class="btn btn-dark btn-lg" data-bs-toggle="modal" role="button" onClick={() => generarReporteBG()}>Generar Balance General</a>
                                </div>
                                {/*
                                Modalidad generada al presionar el boton
                                */}
                                <div id="myModal" class="modal fade">
                                    <div class="modal-dialog modal-xl" role="document">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title" id="exampleModalLongTitle">Balance General</h5>
                                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                            </div>
                                            <div class="modal-body">
                                                <h1> Empresa 1</h1>
                                                <section class ="flex-container">
                                                    
                                                    <div class="activos">
                                                        <h1 class="titulo-seccion"> Activos </h1>
                                                        <h2 class="subtitulo-seccion"> CIRCULANTE</h2>
                                                        <table id="tabla-activos-circulante">
                                                        </table>
                                                        <h2 class="subtitulo-seccion"> FIJO</h2>
                                                        <table id="tabla-activos-fijo">
                                                        </table>
                                                        <h2 class="subtitulo-seccion"> DIFERIDO</h2>
                                                        <table id="tabla-activos-diferido">
                                                        </table>
                                                        
                                                    </div>
                                                    <div class="pasivos-capital">
                                                        <div class="pasivos">
                                                            <h1 class="titulo-seccion"> Pasivos</h1>
                                                            <h2 class="subtitulo-seccion">CIRCULANTE</h2>
                                                            <table id="tabla-pasivos-circulante">    
                                                            </table>
                                                            <h2 class="subtitulo-seccion"> FIJO</h2>
                                                            <table id="tabla-pasivos-fijo">
                                                            </table>
                                                            <h2 class="subtitulo-seccion"> DIFERIDO</h2>
                                                            <table id="tabla-pasivos-diferido">
                                                            </table>
                                                            <table id="tabla-suma-pasivos">
                                                            </table>
                                                        </div>
                                                        <div class="capital">
                                                            <h1 class="titulo-seccion">Capital</h1>
                                                            <h2 class="subtitulo-seccion"> CAPITAL </h2>
                                                            <table id="tabla-capital">
                                                            </table>
                                                            <table id="tabla-suma-capital">
                                                            </table>
                                                        </div>
                                                    </div>
                                                </section>
                                                <section class="flex-container">
                                                    <div class="sumas">
                                                        <table id="tabla-suma-activos">
                                                        </table>
                                                    </div>
                                                    <div class="sumas">
                                                        <table id="tabla-suma-pc">
                                                        </table>
                                                    </div>
                                                </section>
                                            </div>
                                            <div class="modal-footer">
                                                <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onClick={() => {setReportGenerated(current => !current)}}>OK</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row justify-content-center">
                                <div class="col-md-auto">
                                <a href="#myModal1" class="btn btn-dark btn-lg" data-bs-toggle="modal" role="button">Generar Estado de Resultados</a>
                                <div id="myModal1" class="modal fade">
                                    <div class="modal-dialog modal-xl" role="document">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title" id="exampleModalLongTitle">Estado de Resultados</h5>
                                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                            </div>
                                            <div class="modal-body">
                                                <section class ="flex-container">
                                                    <table class="table-responsive table-borderless">
                                                        <thead>
                                                            <th scope="col"></th>
                                                            <th class="tituloCentro" scope="col">Periodo</th>
                                                            <th class="tituloCentro" scope="col">%</th>
                                                            <th class="tituloCentro" scope="col">Acomulado</th>
                                                            <th class="tituloCentro" scope="col">%</th>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <th scope="row">I&nbsp;n&nbsp;g&nbsp;r&nbsp;e&nbsp;s&nbsp;o&nbsp;s</th>
                                                            </tr>
                                                            <tr>
                                                                <td scope="row">Servicios</td>
                                                                <td class="cantidad">187,725.94</td>
                                                                <td class="porcentaje">100.00</td>
                                                                <td class="cantidad"> 1,578,932.85</td>
                                                                <td class="porcentaje">100.00</td>
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
                                                                <td class="cantidad">187,725.94</td>
                                                                <td class="porcentaje">100.00</td>
                                                                <td class="cantidad">1,578,932.85</td>
                                                                <td class="porcentaje">100.00</td>
                                                            </tr>
                                                            <tr>
                                                                <th scope="row">E&nbsp;g&nbsp;r&nbsp;e&nbsp;s&nbsp;o&nbsp;s</th>
                                                            </tr>
                                                            <tr>
                                                                <td scope="row">GASTOS DE SERVICIO</td>
                                                            </tr>
                                                            <tr>
                                                                <td scope="row">Servicio de Operacion</td>
                                                                <td class="cantidad">57,897.22 </td>
                                                                <td class="porcentaje">30.84</td>
                                                                <td class="cantidad">358,346.14 </td>
                                                                <td class="porcentaje">22.70</td>
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
                                                                <td class="cantidad">57,897.22 </td>
                                                                <td class="porcentaje">30.84</td>
                                                                <td class="cantidad">358,346.14 </td>
                                                                <td class="porcentaje">22.70</td>
                                                            </tr>
                                                            <tr>
                                                                <td scope="row">GASTOS FINANCIEROS</td>
                                                                <td class="cantidad">1,181.94 </td>
                                                                <td class="porcentaje">0.63</td>
                                                                <td class="cantidad">8,964.76 </td>
                                                                <td class="porcentaje">0.57</td>
                                                            </tr>
                                                            <tr>
                                                                <td scope="row"><i> &nbsp;GASTOS ADMINISTRATIVOS</i></td>
                                                            </tr>
                                                            <tr>
                                                                <td scope="row">Mant de Eq de Transporte</td>
                                                                <td class="cantidad">4,241.46  </td>
                                                                <td class="porcentaje">2.26</td>
                                                                <td class="cantidad">11,022.04</td>
                                                                <td class="porcentaje">0.70</td>
                                                            </tr>
                                                            <tr>
                                                                <td scope="row">Arrendamineto</td>
                                                                <td class="cantidad">4,720.29  </td>
                                                                <td class="porcentaje">2.51</td>
                                                                <td class="cantidad">28,321.70</td>
                                                                <td class="porcentaje">1.79</td>
                                                            </tr>
                                                            <tr>
                                                                <td scope="row">Primas de seguro</td>
                                                                <td class="cantidad">4,591.01</td>
                                                                <td class="porcentaje">2.45</td>
                                                                <td class="cantidad">20,853.83</td>
                                                                <td class="porcentaje">1.32</td>
                                                            </tr>
                                                            <tr>
                                                                <td scope="row">Luz</td>
                                                                <td class="cantidad">5,047.07</td>
                                                                <td class="porcentaje">2.69</td>
                                                                <td class="cantidad">10,103.32 </td>
                                                                <td class="porcentaje">0.64</td>
                                                            </tr>
                                                            <tr>
                                                                <td scope="row">Papeleria y Utiles</td>
                                                                <td class="cantidad">499.48</td>
                                                                <td class="porcentaje">0.27</td>
                                                                <td class="cantidad">3732.11</td>
                                                                <td class="porcentaje">0.24</td>
                                                            </tr>

                                                        </tbody>
                                                    </table>
                                                </section>
                                            </div>
                                            <div class="modal-footer">
                                                <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
                                            </div>
                                        </div>
                                    </div>    
                                </div>
                            </div>
                            <div class="row justify-content-center">
                                <div class="col-md-auto">
                                <a href="#myModal2" class="btn btn-dark btn-lg" data-bs-toggle="modal" role="button">Generar Balance de comprobacion</a>
                                <div id="myModal2" class="modal fade">
                                    <div class="modal-dialog modal-xl" role="document">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title" id="exampleModalLongTitle">Balance de Comprobación</h5>
                                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                            </div>
                                            <div class="modal-body">
                                                <section class ="flex-container">
                                                    <table class="table-responsive table-borderless">
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
                                            <div class="modal-footer">
                                                <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
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