import React, { useEffect, useState } from "react";
import axios from "axios";
import { Helmet } from 'react-helmet';
import Select from 'react-select';
import swal from 'sweetalert';
import Pdf from "react-to-pdf";

const reference2 = React.createRef();

const Swal = require('sweetalert2');

function DescargarPDF_ER( {userEmail, userContraseña} ){

    //Estado ER
    const [cuentasER, setCuentasER] = useState({});

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

    const generarReporteER = () => {
        var ingresosTotal = [0, 0];
        var egresosTotal = [0, 0];
        var ingresos = [];
        var egresos = [];
        var egresosSub = {};
        var asignacion = {};
        var diccionarioCN = {};

        console.log("ruta: ", `/recibir_FechasDe_Movimientos/${Mes_Rep1}/${Mes_Rep2}/${userEmail}/${userContraseña}`);

        axios.all([
            axios.get(`/recibirCuentas/${userEmail}/${userContraseña}`), 
            axios.get(`/recibir_FechasDe_Movimientos/${Mes_Rep1}/${Mes_Rep2}/${userEmail}/${userContraseña}`)
        ])
        .then(axios.spread((resp1, resp2) => {
            var catalogoCuentas = resp1.data;
            var movimientos = resp2.data;
            var pendientes = [];
            
            console.log("Comenzamos");
            console.log(catalogoCuentas);
            console.log(movimientos);
            //Revisar el catálogo y ver cuentas que estarán en el reporte ER
            for (let i = 0; i < catalogoCuentas.length; i++) {
                setCuentasER(cuentasER[catalogoCuentas[i]["Codigo"]] = [0, 0]);
                if (parseInt(catalogoCuentas[i]["Codigo"].substring(0,3)) >= 400 && parseInt(catalogoCuentas[i]["Codigo"].substring(0,3)) < 500) {
                    ingresos.push(catalogoCuentas[i]["Codigo"]);
                    diccionarioCN[catalogoCuentas[i]["Codigo"]] = catalogoCuentas[i]["Nombre"];
                    diccionarioCN[catalogoCuentas[i]["Nombre"]] = catalogoCuentas[i]["Codigo"];
                } else if (parseInt(catalogoCuentas[i]["Codigo"].substring(0,3)) > 500 && catalogoCuentas[i]["Codigo"].substring(4,8) == "0000") {
                    egresos.push(catalogoCuentas[i]["Codigo"]);
                    asignacion[catalogoCuentas[i]["Codigo"].substring(0,3)] = catalogoCuentas[i]["Codigo"];
                    egresosSub[asignacion[catalogoCuentas[i]["Codigo"].substring(0,3)]] = [];
                    diccionarioCN[catalogoCuentas[i]["Codigo"]] = catalogoCuentas[i]["Nombre"];
                    diccionarioCN[catalogoCuentas[i]["Nombre"]] = catalogoCuentas[i]["Codigo"];
                } else if (parseInt(catalogoCuentas[i]["Codigo"].substring(0,3)) > 500) {
                    if (asignacion[catalogoCuentas[i]["Codigo"].substring(0,3)] == null) {
                        pendientes.push(catalogoCuentas[i]);
                    } else {
                        egresosSub[asignacion[catalogoCuentas[i]["Codigo"].substring(0,3)]].push(catalogoCuentas[i]["Codigo"]);
                        diccionarioCN[catalogoCuentas[i]["Codigo"]] = catalogoCuentas[i]["Nombre"];
                        diccionarioCN[catalogoCuentas[i]["Nombre"]] = catalogoCuentas[i]["Codigo"];
                    }
                }
            }

            //Revisar casos donde todavía no estaba la categoria en asignación
            for (let i = 0; i < pendientes.length; i++) {
                if (asignacion[pendientes[i]["Codigo"].substring(0,3)] != null) {
                    egresosSub[asignacion[pendientes[i]["Codigo"].substring(0,3)]].push(pendientes[i]["Codigo"]);
                    diccionarioCN[catalogoCuentas[i]["Codigo"]] = catalogoCuentas[i]["Nombre"];
                    diccionarioCN[catalogoCuentas[i]["Nombre"]] = catalogoCuentas[i]["Codigo"];
                }
            }
            console.log("A ver las cuentas");
            console.log(pendientes);
            console.log(cuentasER);

            //Analizar movimientos para conseguir los totales de las subcategorías 
            for (let i = 0; i < movimientos.length; i++) {
                if (((movimientos[i]["Categoria_Total"] != null && movimientos[i]["Categoria_Total"] != "Movimiento de Cuenta Común" 
                && (parseInt(movimientos[i]["Cuenta"].substring(0,3)) >= 400)
                && (movimientos[i]["Total_Cargos"] || movimientos[i]["Total_Abonos"] || movimientos[i]["Total_Saldo"])))) {
                    let codigo = "";
                    if (movimientos[i]["Cuenta"] != diccionarioCN[movimientos[i]["Categoria_Total"]] && diccionarioCN[movimientos[i]["Categoria_Total"]] != null) {
                        codigo = diccionarioCN[movimientos[i]["Categoria_Total"]];
                    } else if (diccionarioCN[movimientos[i]["Categoria_Total"]] == null) {
                        codigo = movimientos[i]["Cuenta"];
                        diccionarioCN[movimientos[i]["Categoria_Total"]] = codigo;
                        diccionarioCN[codigo] = movimientos[i]["Categoria_Total"];
                    } else {
                        codigo = movimientos[i]["Cuenta"];
                    }

                    console.log("Codigo decidido:", codigo);
                    if (movimientos[i]["Total_Cargos"] > 0 && movimientos[i]["Total_Abonos"] == 0) {
                        var currObj = cuentasER[codigo];
                        currObj[0] += movimientos[i]["Total_Cargos"];
                        currObj[1] += movimientos[i]["Total_Saldo"];
                        setCuentasER(cuentasER[codigo] = currObj);
                    } else{
                        var currObj = cuentasER[codigo];
                        currObj[0] += movimientos[i]["Total_Abonos"];
                        currObj[1] += movimientos[i]["Total_Saldo"];
                        setCuentasER(cuentasER[codigo] = currObj);
                    }
                }
            }
            //Calcular el total de ingresos
            for (let i = 0; i<ingresos.length; i++) {
                if (cuentasER[ingresos[i]] != null) {
                    ingresosTotal[0] += cuentasER[ingresos[i]][0];
                    ingresosTotal[1] += cuentasER[ingresos[i]][1];
                }
            }
            console.log("Calculando total de ingresos");
            //Calcular el total de cada categoría de egresos
            for (let i = 0; i<egresos.length; i++) {
                var currTotal = [0,0];
                console.log("Vamos con la categoria: ", diccionarioCN[egresos[i]]);
                console.log(cuentasER[egresos[i]]);
                if (cuentasER[egresos[i]][0] == 0 && cuentasER[egresos[i]][1] == 0) {
                    for (let j = 0; j<egresosSub[egresos[i]].length; j++) {
                        console.log("Vamos con la subcategoria: ", diccionarioCN[egresosSub[egresos[i]]]);
                        if(cuentasER[egresosSub[egresos[i]][j]] != null) {
                            currTotal[0] += cuentasER[egresosSub[egresos[i]][j]][0];
                            currTotal[1] += cuentasER[egresosSub[egresos[i]][j]][1];
                        }
                    }
                    egresosTotal[0] += currTotal[0];
                    egresosTotal[1] += currTotal[1];
                    setCuentasER(cuentasER[egresos[i]] = currTotal);
                } else {
                    egresosTotal[0] += cuentasER[egresos[i]][0];
                    egresosTotal[1] += cuentasER[egresos[i]][1];
                }
            }
            console.log(diccionarioCN);
            console.log(ingresos);
            console.log(egresos);
            console.log(egresosSub);
            console.log(ingresosTotal);
            console.log(egresosTotal);
            console.log(cuentasER);
            //Añadir contenido HTML a la página: 

            //Añadir titulo de ingresos: 
            var ERTable = document.getElementById("tablaER");
            var row = ERTable.insertRow(ERTable.rows.length);
            var cell0 = row.insertCell(0);
            var element = document.createElement("strong");
            element.innerHTML = "Ingresos";
            cell0.appendChild(element);

            //Agregar subcategorías de ingresos:
            for (let i = 0; i < ingresos.length; i++) {
                if (cuentasER[ingresos[i]] != null && (cuentasER[ingresos[i]][0] != 0 || cuentasER[ingresos[i]][1] != 0)) {
                    var Irow = ERTable.insertRow(ERTable.rows.length);
                    var ICell0 = Irow.insertCell(0);
                    var Ielement = document.createElement("p");
                    Ielement.innerHTML = diccionarioCN[ingresos[i]];
                    ICell0.appendChild(Ielement);

                    var ICell1 = Irow.insertCell(1);
                    Ielement = document.createElement("p");
                    Ielement.innerHTML = (cuentasER[ingresos[i]][0]).toFixed(2);
                    ICell1.appendChild(Ielement);

                    var ICell2 = Irow.insertCell(2);
                    Ielement = document.createElement("p");
                    Ielement.innerHTML = ((cuentasER[ingresos[i]][0] / ingresosTotal[0]) * 100).toFixed(2);
                    ICell2.appendChild(Ielement);

                    var ICell3 = Irow.insertCell(3);
                    Ielement = document.createElement("p");
                    Ielement.innerHTML = (cuentasER[ingresos[i]][1]).toFixed(2);
                    ICell3.appendChild(Ielement);

                    var ICell4 = Irow.insertCell(4);
                    Ielement = document.createElement("p");
                    Ielement.innerHTML = ((cuentasER[ingresos[i]][1] / ingresosTotal[1]) * 100).toFixed(2)
                    ICell4.appendChild(Ielement);
                }
            }
            
            //Agregar total de ingresos
            var TIrow = ERTable.insertRow(ERTable.rows.length);
            var TIcell0 = TIrow.insertCell(0);
            var TIelement = document.createElement("strong");
            TIelement.innerHTML = "Total Ingresos";
            TIcell0.appendChild(TIelement);

            var TIcell1 = TIrow.insertCell(1);
            TIelement = document.createElement("p");
            TIelement.innerHTML = (ingresosTotal[0]).toFixed(2);
            TIcell1.appendChild(TIelement);

            var TIcell2 = TIrow.insertCell(2);
            TIelement = document.createElement("p");
            TIelement.innerHTML = ((ingresosTotal[0] / ingresosTotal[0]) * 100).toFixed(2);
            TIcell2.appendChild(TIelement);

            var TIcell3 = TIrow.insertCell(3);
            TIelement = document.createElement("p");
            TIelement.innerHTML = (ingresosTotal[1]).toFixed(2);
            TIcell3.appendChild(TIelement);

            var TIcell4 = TIrow.insertCell(4);
            TIelement = document.createElement("p");
            TIelement.innerHTML = ((ingresosTotal[1] / ingresosTotal[1]) * 100).toFixed(2)
            TIcell4.appendChild(TIelement);

            //Agregar titulo de egresos
            row = ERTable.insertRow(ERTable.rows.length);
            cell0 = row.insertCell(0);
            element = document.createElement("strong");
            element.innerHTML = "Egresos";
            cell0.appendChild(element);

            //Agregar cada categoria de egresos
            egresos.sort();
            for (let i = 0; i < egresos.length; i++) {
                if (cuentasER[egresos[i]]  && (cuentasER[egresos[i]][0] != 0 || cuentasER[egresos[i]][0] != 0)) {
                    //Agregar título de categoría
                    var Erow = ERTable.insertRow(ERTable.rows.length);
                    var Ecell0 = Erow.insertCell(0);
                    var Eelement = document.createElement("p");
                    Eelement.innerHTML = diccionarioCN[egresos[i]];
                    Ecell0.appendChild(Eelement);

                    //Agregar cada subcategoría
                    egresosSub[egresos[i]].sort();
                    for (let j = 0; j<egresosSub[egresos[i]].length;j++) {
                        if (cuentasER[egresosSub[egresos[i]][j]] != null && (cuentasER[egresosSub[egresos[i]][j]][0] != 0 || cuentasER[egresosSub[egresos[i]][j]][1] != 0)) {
                            var SErow = ERTable.insertRow(ERTable.rows.length);

                            var SEcell0 = SErow.insertCell(0);
                            var SEelement = document.createElement("p");
                            SEelement.innerHTML = diccionarioCN[egresosSub[egresos[i]][j]];
                            SEcell0.appendChild(SEelement);

                            var SEcell1 = SErow.insertCell(1);
                            SEelement = document.createElement("p");
                            SEelement.innerHTML = (cuentasER[egresosSub[egresos[i]][j]][0]).toFixed(2);
                            SEcell1.appendChild(SEelement);

                            var SEcell2 = SErow.insertCell(2);
                            SEelement = document.createElement("p");
                            SEelement.innerHTML = ((cuentasER[egresosSub[egresos[i]][j]][0] / ingresosTotal[0]) * 100).toFixed(2);
                            SEcell2.appendChild(SEelement);

                            var SEcell3 = SErow.insertCell(3);
                            SEelement = document.createElement("p");
                            SEelement.innerHTML = (cuentasER[egresosSub[egresos[i]][j]][1]).toFixed(2);
                            SEcell3.appendChild(SEelement);

                            var SEcell4 = SErow.insertCell(4);
                            SEelement = document.createElement("p");
                            SEelement.innerHTML = ((cuentasER[egresosSub[egresos[i]][j]][1] / ingresosTotal[1]) * 100).toFixed(2);
                            SEcell4.appendChild(SEelement);
                        }
                    }
                    //Agregar total de la categoría
                    Erow = ERTable.insertRow(ERTable.rows.length);

                    Ecell0 = Erow.insertCell(0);
                    Eelement = document.createElement("p");
                    Eelement.innerHTML = "Total ".concat(diccionarioCN[egresos[i]]);
                    Ecell0.appendChild(Eelement);

                    var Ecell1 = Erow.insertCell(1);
                    Eelement = document.createElement("p");
                    Eelement.innerHTML = (cuentasER[egresos[i]][0]).toFixed(2);
                    Ecell1.appendChild(Eelement);

                    var Ecell2 = Erow.insertCell(2);
                    Eelement = document.createElement("p");
                    Eelement.innerHTML = ((cuentasER[egresos[i]][0] / ingresosTotal[0]) * 100).toFixed(2);
                    Ecell2.appendChild(Eelement);

                    var Ecell3 = Erow.insertCell(3);
                    Eelement = document.createElement("p");
                    Eelement.innerHTML = (cuentasER[egresos[i]][1]).toFixed(2);
                    Ecell3.appendChild(Eelement);

                    var Ecell4 = Erow.insertCell(4);
                    Eelement = document.createElement("p");
                    Eelement.innerHTML = ((cuentasER[egresos[i]][1] / ingresosTotal[1]) * 100).toFixed(2);
                    Ecell4.appendChild(Eelement);
                }
            }

            //Agregar total de egresos
            var TErow = ERTable.insertRow(ERTable.rows.length);
            var TEcell0 = TErow.insertCell(0);
            var TEelement = document.createElement("strong");
            TEelement.innerHTML = "Total Egresos";
            TEcell0.appendChild(TEelement);

            var TEcell1 = TErow.insertCell(1);
            TEelement = document.createElement("p");
            TEelement.innerHTML = (egresosTotal[0]).toFixed(2);
            TEcell1.appendChild(TEelement);

            var TEcell2 = TErow.insertCell(2);
            TEelement = document.createElement("p");
            TEelement.innerHTML = ((egresosTotal[0] / ingresosTotal[0]) * 100).toFixed(2);
            TEcell2.appendChild(TEelement);

            var TEcell3 = TErow.insertCell(3);
            TEelement = document.createElement("p");
            TEelement.innerHTML = (egresosTotal[1]).toFixed(2);
            TEcell3.appendChild(TEelement);

            var TEcell4 = TErow.insertCell(4);
            TEelement = document.createElement("p");
            TEelement.innerHTML = ((egresosTotal[1] / ingresosTotal[1]) * 100).toFixed(2)
            TEcell4.appendChild(TEelement);

            //Agregar utilidad
            var TErow = ERTable.insertRow(ERTable.rows.length);
            var TEcell0 = TErow.insertCell(0);
            var TEelement = document.createElement("strong");
            TEelement.innerHTML = "Utilidad (o Pérdida)";
            TEcell0.appendChild(TEelement);

            var TEcell1 = TErow.insertCell(1);
            TEelement = document.createElement("p");
            TEelement.innerHTML = (ingresosTotal[0] - egresosTotal[0]).toFixed(2);
            TEcell1.appendChild(TEelement);

            var TEcell2 = TErow.insertCell(2);
            TEelement = document.createElement("p");
            TEelement.innerHTML = (((ingresosTotal[0] - egresosTotal[0]) / ingresosTotal[0]) * 100).toFixed(2);
            TEcell2.appendChild(TEelement);

            var TEcell3 = TErow.insertCell(3);
            TEelement = document.createElement("p");
            TEelement.innerHTML = (ingresosTotal[0] - egresosTotal[1]).toFixed(2);
            TEcell3.appendChild(TEelement);

            var TEcell4 = TErow.insertCell(4);
            TEelement = document.createElement("p");
            TEelement.innerHTML = (((ingresosTotal[1] - egresosTotal[1]) / ingresosTotal[1]) * 100).toFixed(2)
            TEcell4.appendChild(TEelement);
        }));


    }; 

    const options = {
        orientation: 'portrait',
        unit: 'in',
        format: [40,13]
    };

    return(
        <div className="container micontenedor">
            <Helmet>
                <title>Descargar Estado de Resultados</title>
            </Helmet>
            <h1>Tu Estado de Resultados </h1>
                <div className="col-md-auto align-items-center text-center">
                    <h5>¿No es correcto? Pulsa "Actualizar Estado de Resultados"</h5>
                </div>
                    {/* generarReporteER() */}
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
        
                    {/*Boton Estado de Resultados*/}
                    <div className="col-md-auto align-items-center text-center">
                                <a href="#myModal1" className="btn btn-primary btn-lg btn-costum-size" role="button" onClick={() => generarReporteER()}>Actualizar Estado de Resultados</a>
                                
                                {/*
                                Modalidad Estado de resultados generada al presionar el boton
                                */}
    
                                <div id="myModal1" ref={reference2} >
                                    
                                        <div className="modal-dialog modal-xl" role="document">
                                            <div className="modal-content">
                                                <div className="modal-header">
                                                    <h5 className="modal-title" id="exampleModalLongTitle">Estado de Resultados</h5>
                                                    
                                                    <Pdf targetRef={reference2} filename="Estado de Resultados.pdf">
                                                        {({ toPdf }) => <button className="btn btn-primary" onClick={toPdf}>Descargar PDF "Estado de Resultados"</button>}
                                                    </Pdf>
                                                
                                                </div>
                                                <div className="modal-body">
                                                    <section className ="flex-container">
                                                        <table id="tablaER" className="table-responsive table-borderless">
                                                            <thead>
                                                                <th scope="col"></th>
                                                                <th className="tituloCentro" scope="col">Periodo</th>
                                                                <th className="tituloCentro" scope="col">%</th>
                                                                <th className="tituloCentro" scope="col">Acomulado</th>
                                                                <th className="tituloCentro" scope="col">%</th>
                                                            </thead>
                                                            <tbody>

                                                            </tbody>
                                                        </table>
                                                    </section>
                                                </div>
                                               
                                            </div>
                                        </div>  
                                     
                                </div>
                            </div>
        </div>
    );
}

export default DescargarPDF_ER;