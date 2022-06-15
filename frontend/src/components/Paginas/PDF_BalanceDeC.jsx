import React, { useEffect, useState } from "react";
import axios from "axios";
import { Helmet } from 'react-helmet';
import Select from 'react-select';
import swal from 'sweetalert';
import Pdf from "react-to-pdf";

const reference3 = React.createRef();

const Swal = require('sweetalert2');

function DescargarPDF_BC( {userEmail, userContraseña} ){

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

    //Estado BC
    const [cuentasBC, setCuentasBC] = useState({});

    const generarReporteBC = () => {
        var diccionarioCN = {};
        var categoriasEspeciales = {
            "000-0110": [], //Activo Circulante
            "000-0120": [], //Activo Fijo
            "000-0140": [], //Activo Diferido
            "000-0210": [], //Pasivo Circulante
            "000-0220": [], //Pasivo Fijo
            "000-0230": [], //Pasivo Diferido
        };
        var categoriasGrandes = {
            "000-0100": ["000-0110", "000-0120", "000-0140"], //Activos
            "000-0200": ["000-0210", "000-0220", "000-0230"], //Pasivos
            "000-0300": [], //Capital
            "000-0400": [], //Resultados Acreedoras
            "000-0500": [] //Resultados Deudoras
        };
        var subs = {}

        axios.all([
            axios.get('/recibirCuentas'), 
            axios.get(`/recibir_FechasDe_Movimientos/${Mes_Rep1}/${Mes_Rep2}`)
          ])
          .then(axios.spread((resp1, resp2) => {
            var catalogoCuentas = resp1.data;
            var movimientos = resp2.data;
            var pendientes = [];
            var orden = [];

            //Revisar el catálogo y empezar con asignación en 0s
            for (let i = 0; i < catalogoCuentas.length; i++) {
                setCuentasBC(cuentasBC[catalogoCuentas[i]["Codigo"]] = [0,0,0,0]);
                diccionarioCN[catalogoCuentas[i]["Codigo"]] = catalogoCuentas[i]["Nombre"];
                diccionarioCN[catalogoCuentas[i]["Nombre"]] = catalogoCuentas[i]["Codigo"];
                let codigo = catalogoCuentas[i]["Codigo"];
                let prefijo = parseInt(codigo.substring(0,3));
                if (codigo.substring(0,6) == "000-03") {
                    categoriasGrandes["000-0300"].push(codigo);
                } else if (codigo.substring(4,8) == "0000") {
                    subs[codigo] = [];
                    if (prefijo < 400) {
                        if (prefijo >= 100 && prefijo < 119) {
                            categoriasEspeciales["000-0110"].push(codigo);
                        } else if (prefijo >= 120 && prefijo < 140) {
                            categoriasEspeciales["000-0120"].push(codigo);
                        } else if (prefijo >= 140 && prefijo < 199) {
                            categoriasEspeciales["000-0140"].push(codigo);
                        } else if (prefijo >= 200 && prefijo < 219) {
                            categoriasEspeciales["000-0210"].push(codigo);
                        } else if (prefijo >= 220 && prefijo < 230) {
                            categoriasEspeciales["000-0220"].push(codigo);
                        } else {
                            categoriasEspeciales["000-0230"].push(codigo);
                        }
                    } else {
                        if (prefijo < 500) {
                            categoriasGrandes["000-0400"].push(codigo);
                        } else {
                            categoriasGrandes["000-0500"].push(codigo);
                        }
                    }
                } else if (prefijo != 0) {
                    let subCodigo = toString(prefijo).concat("-0000");
                    if (subs[subCodigo] == null) {
                        pendientes.push(codigo);
                    } else {
                        subs[subCodigo].push(codigo);
                    }
                }
            }

            //Añadir pendientes
            for (let i = 0; i < pendientes.length; i++) {
                let subCodigo = pendientes[i].substring(0,3).concat("-0000");
                subs[subCodigo].push(pendientes[i]);
            } 

            //Revisar movimientos y asignar valores para la tabla
            for (let i = 0; i < movimientos.length; i++) {
                if (movimientos[i]["Categoria_Total"] != null) {
                    let sInicial;
                    if ((parseInt(movimientos[i]["Cuenta"].substring(0,3)) >= 200 && parseInt(movimientos[i]["Cuenta"].substring(0,3)) < 300) ||
                        (parseInt(movimientos[i]["Cuenta"].substring(0,3)) >= 400 && parseInt(movimientos[i]["Cuenta"].substring(0,3)) < 500)) {
                        sInicial = movimientos[i]["Total_Saldo"] + movimientos[i]["Total_Cargos"] - movimientos[i]["Total_Abonos"];
                    } else {
                        sInicial = movimientos[i]["Total_Saldo"] + movimientos[i]["Total_Abonos"] - movimientos[i]["Total_Cargos"];
                    }
                    if(movimientos[i]["Categoria_Total"] == "Movimiento de Cuenta Común") {
                        setCuentasBC(cuentasBC[movimientos[i]["Cuenta"]] = [sInicial, movimientos[i]["Total_Cargos"], movimientos[i]["Total_Abonos"], movimientos[i]["Total_Saldo"]]);
                    } else {
                        var codigo = "";
                        if (movimientos[i]["Cuenta"] != diccionarioCN[movimientos[i]["Categoria_Total"]] && diccionarioCN[movimientos[i]["Categoria_Total"]] != null) {
                            codigo = diccionarioCN[movimientos[i]["Categoria_Total"]];
                        } else if (diccionarioCN[movimientos[i]["Categoria_Total"]] == null) {
                            codigo = movimientos[i]["Cuenta"];
                            diccionarioCN[movimientos[i]["Categoria_Total"]] = codigo;
                            diccionarioCN[codigo] = movimientos[i]["Categoria_Total"];
                        } else {
                            codigo = movimientos[i]["Cuenta"];
                        }
                        setCuentasBC(cuentasBC[codigo] = [sInicial, movimientos[i]["Total_Cargos"], movimientos[i]["Total_Abonos"], movimientos[i]["Total_Saldo"]]);
                        
                    }
                }
            }

            //Sumar activos circulantes
            for (let i = 0; i < categoriasEspeciales["000-0110"].length; i++) {
                let currObj = cuentasBC["000-0110"];
                currObj[0] += cuentasBC[categoriasEspeciales["000-0110"][i]][0];
                currObj[1] += cuentasBC[categoriasEspeciales["000-0110"][i]][1];
                currObj[2] += cuentasBC[categoriasEspeciales["000-0110"][i]][2];
                currObj[3] += cuentasBC[categoriasEspeciales["000-0110"][i]][3];
                setCuentasBC(cuentasBC["000-0110"] = currObj);
            }
            console.log(cuentasBC["000-0110"]);

            
            //Sumar activos fijos
            for (let i = 0; i < categoriasEspeciales["000-0120"].length; i++) {
                let currObj = cuentasBC["000-0120"];
                if (diccionarioCN[categoriasEspeciales["000-0120"][i]].substring(0,12) == "Depreciación") {
                    currObj[0] -= cuentasBC[categoriasEspeciales["000-0120"][i]][0];
                    currObj[1] -= cuentasBC[categoriasEspeciales["000-0120"][i]][1];
                    currObj[2] -= cuentasBC[categoriasEspeciales["000-0120"][i]][2];
                    currObj[3] -= cuentasBC[categoriasEspeciales["000-0120"][i]][3];
                    setCuentasBC(cuentasBC["000-0120"] = currObj);
                } else {
                    currObj[0] += cuentasBC[categoriasEspeciales["000-0120"][i]][0];
                    currObj[1] += cuentasBC[categoriasEspeciales["000-0120"][i]][1];
                    currObj[2] += cuentasBC[categoriasEspeciales["000-0120"][i]][2];
                    currObj[3] += cuentasBC[categoriasEspeciales["000-0120"][i]][3];
                    setCuentasBC(cuentasBC["000-0120"] = currObj);
                }
            }
            console.log(cuentasBC["000-0120"]);

            //Sumar activos diferidos
            for (let i = 0; i < categoriasEspeciales["000-0140"].length; i++) {
                let currObj = cuentasBC["000-0140"];
                if (diccionarioCN[categoriasEspeciales["000-0140"][i]].substring(0,12) == "Depreciación") {
                    currObj[0] -= cuentasBC[categoriasEspeciales["000-0140"][i]][0];
                    currObj[1] -= cuentasBC[categoriasEspeciales["000-0140"][i]][1];
                    currObj[2] -= cuentasBC[categoriasEspeciales["000-0140"][i]][2];
                    currObj[3] -= cuentasBC[categoriasEspeciales["000-0140"][i]][3];
                    setCuentasBC(cuentasBC["000-0140"] = currObj);
                } else {
                    currObj[0] += cuentasBC[categoriasEspeciales["000-0140"][i]][0];
                    currObj[1] += cuentasBC[categoriasEspeciales["000-0140"][i]][1];
                    currObj[2] += cuentasBC[categoriasEspeciales["000-0140"][i]][2];
                    currObj[3] += cuentasBC[categoriasEspeciales["000-0140"][i]][3];
                    setCuentasBC(cuentasBC["000-0140"] = currObj);
                }
            }
            console.log(cuentasBC["000-0140"]);

            //Sumar total activos
            for (let i = 0; i < categoriasGrandes["000-0100"].length; i++) {
                let currObj = cuentasBC["000-0100"];
                if (diccionarioCN[categoriasGrandes["000-0100"][i]].substring(0,12) == "Depreciación") {
                    currObj[0] -= cuentasBC[categoriasGrandes["000-0100"][i]][0];
                    currObj[1] -= cuentasBC[categoriasGrandes["000-0100"][i]][1];
                    currObj[2] -= cuentasBC[categoriasGrandes["000-0100"][i]][2];
                    currObj[3] -= cuentasBC[categoriasGrandes["000-0100"][i]][3];
                    setCuentasBC(cuentasBC["000-0100"] = currObj);
                } else {
                    currObj[0] += cuentasBC[categoriasGrandes["000-0100"][i]][0];
                    currObj[1] += cuentasBC[categoriasGrandes["000-0100"][i]][1];
                    currObj[2] += cuentasBC[categoriasGrandes["000-0100"][i]][2];
                    currObj[3] += cuentasBC[categoriasGrandes["000-0100"][i]][3];
                    setCuentasBC(cuentasBC["000-0100"] = currObj);
                }
            }
            console.log(cuentasBC["000-0100"]);
            
            //Sumar pasivos circulantes
            for (let i = 0; i < categoriasEspeciales["000-0210"].length; i++) {
                let currObj = cuentasBC["000-0210"];
                if (diccionarioCN[categoriasEspeciales["000-0210"][i]].substring(0,12) == "Depreciación") {
                    currObj[0] -= cuentasBC[categoriasEspeciales["000-0210"][i]][0];
                    currObj[1] -= cuentasBC[categoriasEspeciales["000-0210"][i]][1];
                    currObj[2] -= cuentasBC[categoriasEspeciales["000-0210"][i]][2];
                    currObj[3] -= cuentasBC[categoriasEspeciales["000-0210"][i]][3];
                    setCuentasBC(cuentasBC["000-0210"] = currObj);
                } else {
                    currObj[0] += cuentasBC[categoriasEspeciales["000-0210"][i]][0];
                    currObj[1] += cuentasBC[categoriasEspeciales["000-0210"][i]][1];
                    currObj[2] += cuentasBC[categoriasEspeciales["000-0210"][i]][2];
                    currObj[3] += cuentasBC[categoriasEspeciales["000-0210"][i]][3];
                    setCuentasBC(cuentasBC["000-0210"] = currObj);
                }
            }
            console.log(cuentasBC["000-0210"]);

            //Sumar pasivos fijos
            for (let i = 0; i < categoriasEspeciales["000-0220"].length; i++) {
                let currObj = cuentasBC["000-0220"];
                if (diccionarioCN[categoriasEspeciales["000-0220"][i]].substring(0,12) == "Depreciación") {
                    currObj[0] -= cuentasBC[categoriasEspeciales["000-0220"][i]][0];
                    currObj[1] -= cuentasBC[categoriasEspeciales["000-0220"][i]][1];
                    currObj[2] -= cuentasBC[categoriasEspeciales["000-0220"][i]][2];
                    currObj[3] -= cuentasBC[categoriasEspeciales["000-0220"][i]][3];
                    setCuentasBC(cuentasBC["000-0220"] = currObj);
                } else {
                    currObj[0] += cuentasBC[categoriasEspeciales["000-0220"][i]][0];
                    currObj[1] += cuentasBC[categoriasEspeciales["000-0220"][i]][1];
                    currObj[2] += cuentasBC[categoriasEspeciales["000-0220"][i]][2];
                    currObj[3] += cuentasBC[categoriasEspeciales["000-0220"][i]][3];
                    setCuentasBC(cuentasBC["000-0220"] = currObj);
                }
            }
            console.log(cuentasBC["000-0220"]);

            //Sumar pasivos diferidos
            for (let i = 0; i < categoriasEspeciales["000-0230"].length; i++) {
                let currObj = cuentasBC["000-0230"];
                if (diccionarioCN[categoriasEspeciales["000-0230"][i]].substring(0,12) == "Depreciación") {
                    currObj[0] -= cuentasBC[categoriasEspeciales["000-0230"][i]][0];
                    currObj[1] -= cuentasBC[categoriasEspeciales["000-0230"][i]][1];
                    currObj[2] -= cuentasBC[categoriasEspeciales["000-0230"][i]][2];
                    currObj[3] -= cuentasBC[categoriasEspeciales["000-0230"][i]][3];
                    setCuentasBC(cuentasBC["000-0230"] = currObj);
                } else {
                    currObj[0] += cuentasBC[categoriasEspeciales["000-0230"][i]][0];
                    currObj[1] += cuentasBC[categoriasEspeciales["000-0230"][i]][1];
                    currObj[2] += cuentasBC[categoriasEspeciales["000-0230"][i]][2];
                    currObj[3] += cuentasBC[categoriasEspeciales["000-0230"][i]][3];
                    setCuentasBC(cuentasBC["000-0230"] = currObj);
                }
            }
            console.log(cuentasBC["000-0230"]);

            //Sumar total pasivos
            for (let i = 0; i < categoriasGrandes["000-0200"].length; i++) {
                let currObj = cuentasBC["000-0200"];
                if (diccionarioCN[categoriasGrandes["000-0200"][i]].substring(0,12) == "Depreciación") {
                    currObj[0] -= cuentasBC[categoriasGrandes["000-0200"][i]][0];
                    currObj[1] -= cuentasBC[categoriasGrandes["000-0200"][i]][1];
                    currObj[2] -= cuentasBC[categoriasGrandes["000-0200"][i]][2];
                    currObj[3] -= cuentasBC[categoriasGrandes["000-0200"][i]][3];
                    setCuentasBC(cuentasBC["000-0200"] = currObj);
                } else {
                    currObj[0] += cuentasBC[categoriasGrandes["000-0200"][i]][0];
                    currObj[1] += cuentasBC[categoriasGrandes["000-0200"][i]][1];
                    currObj[2] += cuentasBC[categoriasGrandes["000-0200"][i]][2];
                    currObj[3] += cuentasBC[categoriasGrandes["000-0200"][i]][3];
                    setCuentasBC(cuentasBC["000-0200"] = currObj);
                }
            }
            console.log(cuentasBC["000-0200"]);

            //Sumar capital
            for (let i = 0; i < categoriasGrandes["000-0300"].length; i++) {
                let currObj = cuentasBC["000-0300"];
                if (diccionarioCN[categoriasGrandes["000-0300"][i]].substring(0,12) == "Depreciación") {
                    currObj[0] -= cuentasBC[categoriasGrandes["000-0300"][i]][0];
                    currObj[1] -= cuentasBC[categoriasGrandes["000-0300"][i]][1];
                    currObj[2] -= cuentasBC[categoriasGrandes["000-0300"][i]][2];
                    currObj[3] -= cuentasBC[categoriasGrandes["000-0300"][i]][3];
                    setCuentasBC(cuentasBC["000-0300"] = currObj);
                } else {
                    currObj[0] += cuentasBC[categoriasGrandes["000-0300"][i]][0];
                    currObj[1] += cuentasBC[categoriasGrandes["000-0300"][i]][1];
                    currObj[2] += cuentasBC[categoriasGrandes["000-0300"][i]][2];
                    currObj[3] += cuentasBC[categoriasGrandes["000-0300"][i]][3];
                    setCuentasBC(cuentasBC["000-0300"] = currObj);
                }
            }
            console.log(cuentasBC["000-0300"]);

            //Sumar resultados acreedoras (ingresos)
            for (let i = 0; i < categoriasGrandes["000-0400"].length; i++) {
                let currObj = cuentasBC["000-0400"];
                if (diccionarioCN[categoriasGrandes["000-0400"][i]].substring(0,12) == "Depreciación") {
                    currObj[0] -= cuentasBC[categoriasGrandes["000-0400"][i]][0];
                    currObj[1] -= cuentasBC[categoriasGrandes["000-0400"][i]][1];
                    currObj[2] -= cuentasBC[categoriasGrandes["000-0400"][i]][2];
                    currObj[3] -= cuentasBC[categoriasGrandes["000-0400"][i]][3];
                    setCuentasBC(cuentasBC["000-0400"] = currObj);
                } else {
                    currObj[0] += cuentasBC[categoriasGrandes["000-0400"][i]][0];
                    currObj[1] += cuentasBC[categoriasGrandes["000-0400"][i]][1];
                    currObj[2] += cuentasBC[categoriasGrandes["000-0400"][i]][2];
                    currObj[3] += cuentasBC[categoriasGrandes["000-0400"][i]][3];
                    setCuentasBC(cuentasBC["000-0400"] = currObj);
                }
            }
            console.log(cuentasBC["000-0400"]);

            console.log(subs);

            //Sumar resultados deudoras (egresos)
            for (let i = 0; i < categoriasGrandes["000-0500"].length; i++) {
                let currObj = cuentasBC["000-0500"];
                var currSObj = cuentasBC[categoriasGrandes["000-0500"][i]];
                if (categoriasGrandes["000-0500"][i] != "502-0000") {
                    for ( let j = 0; j<subs[categoriasGrandes["000-0500"][i]].length; j++) {
                        currSObj[0] += cuentasBC[subs[categoriasGrandes["000-0500"][i]][j]][0];
                        currSObj[1] += cuentasBC[subs[categoriasGrandes["000-0500"][i]][j]][1];
                        currSObj[2] += cuentasBC[subs[categoriasGrandes["000-0500"][i]][j]][2];
                        currSObj[3] += cuentasBC[subs[categoriasGrandes["000-0500"][i]][j]][3];
                        setCuentasBC(cuentasBC[categoriasGrandes["000-0500"][i]] = currSObj);
                    }
                }
                if (diccionarioCN[categoriasGrandes["000-0500"][i]].substring(0,12) == "Depreciación") {
                    currObj[0] -= cuentasBC[categoriasGrandes["000-0500"][i]][0];
                    currObj[1] -= cuentasBC[categoriasGrandes["000-0500"][i]][1];
                    currObj[2] -= cuentasBC[categoriasGrandes["000-0500"][i]][2];
                    currObj[3] -= cuentasBC[categoriasGrandes["000-0500"][i]][3];
                    setCuentasBC(cuentasBC["000-0500"] = currObj);
                } else {
                    currObj[0] += cuentasBC[categoriasGrandes["000-0500"][i]][0];
                    currObj[1] += cuentasBC[categoriasGrandes["000-0500"][i]][1];
                    currObj[2] += cuentasBC[categoriasGrandes["000-0500"][i]][2];
                    currObj[3] += cuentasBC[categoriasGrandes["000-0500"][i]][3];
                    setCuentasBC(cuentasBC["000-0500"] = currObj);
                }
            }
            console.log(cuentasBC["000-0500"]);

            //Asignar orden de cuentas del reporte:
            orden.push("000-0100");
            orden.push("000-0110");
            categoriasEspeciales["000-0110"].sort();
            for (let i = 0; i < categoriasEspeciales["000-0110"].length; i++) {
                orden.push(categoriasEspeciales["000-0110"][i]);
                subs[categoriasEspeciales["000-0110"][i]].sort();
                for (let j = 0; j < subs[categoriasEspeciales["000-0110"][i]].length; j++) {
                    orden.push(subs[categoriasEspeciales["000-0110"][i]][j]);
                }
            }
            orden.push("000-0120");
            categoriasEspeciales["000-0120"].sort();
            for (let i = 0; i < categoriasEspeciales["000-0120"].length; i++) {
                orden.push(categoriasEspeciales["000-0120"][i]);
                subs[categoriasEspeciales["000-0120"][i]].sort();
                for (let j = 0; j < subs[categoriasEspeciales["000-0120"][i]].length; j++) {
                    orden.push(subs[categoriasEspeciales["000-0120"][i]][j]);
                }
            }
            orden.push("000-0140");
            categoriasEspeciales["000-0140"].sort();
            for (let i = 0; i < categoriasEspeciales["000-0140"].length; i++) {
                orden.push(categoriasEspeciales["000-0140"][i]);
                subs[categoriasEspeciales["000-0140"][i]].sort();
                for (let j = 0; j < subs[categoriasEspeciales["000-0140"][i]].length; j++) {
                    orden.push(subs[categoriasEspeciales["000-0140"][i]][j]);
                }
            }
            orden.push("000-0200");
            categoriasEspeciales["000-0210"].sort();
            for (let i = 0; i < categoriasEspeciales["000-0210"].length; i++) {
                orden.push(categoriasEspeciales["000-0210"][i]);
                subs[categoriasEspeciales["000-0210"][i]].sort();
                for (let j = 0; j < subs[categoriasEspeciales["000-0210"][i]].length; j++) {
                    orden.push(subs[categoriasEspeciales["000-0210"][i]][j]);
                }
            }
            categoriasEspeciales["000-0220"].sort();
            for (let i = 0; i < categoriasEspeciales["000-0220"].length; i++) {
                orden.push(categoriasEspeciales["000-0220"][i]);
                subs[categoriasEspeciales["000-0220"][i]].sort();
                for (let j = 0; j < subs[categoriasEspeciales["000-0220"][i]].length; j++) {
                    orden.push(subs[categoriasEspeciales["000-0220"][i]][j]);
                }
            }
            categoriasEspeciales["000-0230"].sort();
            for (let i = 0; i < categoriasEspeciales["000-0230"].length; i++) {
                orden.push(categoriasEspeciales["000-0230"][i]);
                subs[categoriasEspeciales["000-0230"][i]].sort();
                for (let j = 0; j < subs[categoriasEspeciales["000-0230"][i]].length; j++) {
                    orden.push(subs[categoriasEspeciales["000-0230"][i]][j]);
                }
            }
            orden.push("000-0300");
            categoriasGrandes["000-0300"].sort();
            for (let i = 0; i < categoriasGrandes["000-0300"].length; i++) {
                orden.push(categoriasGrandes["000-0300"][i]);
            }
            orden.push("000-0400");
            categoriasGrandes["000-0400"].sort();
            for (let i = 0; i < categoriasGrandes["000-0400"].length; i++) {
                orden.push(categoriasGrandes["000-0400"][i]);
                subs[categoriasGrandes["000-0400"][i]].sort();
                for (let j = 0; j < subs[categoriasGrandes["000-0400"][i]].length; j++) {
                    orden.push(subs[categoriasGrandes["000-0400"][i]][j]);
                }
            }
            orden.push("000-0500");
            for (let i = 0; i < categoriasGrandes["000-0500"].length; i++) {
                orden.push(categoriasGrandes["000-0500"][i]);
                subs[categoriasGrandes["000-0500"][i]].sort();
                for (let j = 0; j < subs[categoriasGrandes["000-0500"][i]].length; j++) {
                    orden.push(subs[categoriasGrandes["000-0500"][i]][j]);
                }
            }
            console.log(orden);


            //Añadir HTML en base al orden
            var BCTable = document.getElementById("tablaBC");
            for (let i = 0; i<orden.length; i++) {
                var row = BCTable.insertRow(BCTable.rows.length);
                var cell0 = row.insertCell(0);
                var element = document.createElement("p");
                element.innerHTML = orden[i];
                cell0.appendChild(element);
                
                var cell1 = row.insertCell(1);
                element = document.createElement("p");
                element.innerHTML = diccionarioCN[orden[i]];
                cell1.appendChild(element);

                var cell2 = row.insertCell(2);
                element = document.createElement("p");
                element.innerHTML = cuentasBC[orden[i]][0].toFixed(2);
                cell2.appendChild(element);

                var Acell3 = row.insertCell(3);
                element = document.createElement("p");
                element.innerHTML = cuentasBC[orden[i]][1].toFixed(2);
                Acell3.appendChild(element);

                var cell4 = row.insertCell(4);
                element = document.createElement("p");
                element.innerHTML = cuentasBC[orden[i]][2].toFixed(2);
                cell4.appendChild(element);

                var cell5 = row.insertCell(5);
                element = document.createElement("p");
                element.innerHTML = cuentasBC[orden[i]][3].toFixed(2);
                cell5.appendChild(element);
            }

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
                <title>Descargar Balance de Comprobación</title>
            </Helmet>
            <h1>Tu Balance de Comprobación </h1>
                    <div className="col-md-auto align-items-center text-center">
                    <h5>¿No es correcto? Pulsa "Actualizar Balance de Comprobación"</h5>
                    </div>
                    {/* generarReporteBC() */}
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
        
                    {/*Boton Balance de Comprobación*/}
                    <div className="col-md-auto align-items-center text-center">
                                
                                <a href="#myModal2" className="btn btn-primary btn-lg btn-costum-size" role="button" onClick={() => generarReporteBC()}>Actualizar Balance de Comprobación</a>
                                
                                {/*
                                    Modalidad Balance de comprobacion generada al presionar el boton
                                */}
                                    
                                <div id="myModal2" ref={reference3} >
                                    <div className="modal-dialog modal-xl" role="document">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title" id="exampleModalLongTitle">Balance de Comprobación</h5>
                                                
                                                    <Pdf targetRef={reference3} filename="Balance de Comprobacion.pdf">
                                                        {({ toPdf }) => <button className="btn btn-primary" onClick={toPdf}>Descargar PDF "Balance de Comprobación"</button>}
                                                    </Pdf>
                                                
                                            </div>
                                            <div className="modal-body">
                                                <section className ="flex-container">
                                                    <table id="tablaBC" className="table-responsive table-borderless">
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

export default DescargarPDF_BC;