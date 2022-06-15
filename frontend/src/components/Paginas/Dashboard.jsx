import React, { useEffect, useState } from "react";
import Select from 'react-select';
import axios from "axios";
import swal from 'sweetalert';

const Swal = require('sweetalert2');

function Dashboard( {userEmail, userContraseña} ){

    var Mes_Rep1 = "ene";
    var Mes_Rep2 = "dic";

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

    function mostrarAlertaCat() {
        // Obtener nombre de archivo
        let archivo = document.getElementById('excel-file-Cat').value,
        // Obtener extensión del archivo
            extension = archivo.substring(archivo.lastIndexOf('.'),archivo.length);
        // Si la extensión obtenida no está incluida en la lista de valores
        // del atributo "accept", mostrar un error.
        if(document.getElementById('excel-file-Cat').getAttribute('accept').split(',').indexOf(extension) < 0) {
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
    
    {/*
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
    */}

    function handleClick(event){
        // evita el parpadeo predefinido
        event.preventDefault();
        const excelMov = document.getElementById("excel-file").files;
        console.log(excelMov);
        
    }

    let formData = new FormData();
    
    const onFileChange = async (e) => {
        console.log(e.target.files[0])
        console.log(document.querySelector('#excel-file').files[0])
        if (e.target && e.target.files[0]);
        formData.append('excel', e.target.files[0]);
        mostrarAlerta();
    } 

    const onFileChange_Cat = async (e) => {
        console.log(e.target.files[0])
        console.log(document.querySelector('#excel-file-Cat').files[0])
        if (e.target && e.target.files[0]);
        formData.append('excel', e.target.files[0]);
        mostrarAlertaCat();
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

    const openInNewTab = url => {
        window.open(url, '_blank', 'noopener,noreferrer');
      };

    return(
        <div className="container micontenedor">
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
            <script src="https://parall.ax/parallax/js/jspdf.js"></script>

            <h1>Dashboard</h1>
            <div className="container">
                <div className="row justify-content-center">

                    {/*Columna izquierda o Registro de archivos*/}
                
                    <div className="col-md-5 col-sm-6 leftcol align-items-center">
                        <h1 className="text-center"> Registro de Archivos</h1>
                        <div className="col-md-auto">

                            <div class="col-container"></div>
                            
                            <form action={`/subirMovimientos/${userEmail}/${userContraseña}`} method="POST" enctype="multipart/form-data"> 
                                <div className="form-group">
                                    <label for="excel">Movimientos Auxiliares del Catálogo</label>
                                    <input id="excel-file" accept=".xlsx" type="file" className="form-control" name="excel" onChange={onFileChange} required></input>
                                    <div className="col-md-auto align-items-center text-center">
                                        
                                        <button className="btn btn-dark btn-lg btn-costum-size" type="submit" onClick={alertaPOST}>
                                            Subir Excel (Movimientos Auxiliares del Catálogo) </button>
                                    </div>
                                </div>
                            </form>

                            <div class="col-container"></div>

                            <form action={`/subirCatalogo/${userEmail}/${userContraseña}`} method="POST" encType="multipart/form-data">
                                <div className="form-group">
                                    <label for="excel">Catálogo de Cuentas</label>
                                    <input id="excel-file-Cat" accept=".xlsx" type="file" className="form-control" name="excel" onChange={onFileChange_Cat} required></input>
                                    <div className="col-md-auto align-items-center text-center">
                                        <button className="btn btn-dark btn-lg btn-costum-size" type="submit" onClick={alertaPOST}>Subir Excel (Catálogo de Cuentas)</button>
                                    </div>
                                </div>
                            </form>

                            <div class="col-container"></div>
                        </div>
                    </div>

                    <div class="w-100 d-xl-none"></div>

                    {/*Columna derecha o Generacion de reportes*/}
                    <div className="col-md-5 col-sm-6 rightcol align-items-center">
                        <div className="col-md-auto align-items-center">
                            <h1 className="text-center"> Generacion de Reportes</h1>

                            <div class="col-container"></div>

                            <div class="col-container"></div>

                            <div className="modal-footer">
                                <button className="btn btn-light" onClick={() => openInNewTab('/descargarPDF_BG')}>Descarga tu PDF "Balance General"</button>
                            </div>

                            <div className="modal-footer">
                                <button className="btn btn-light" onClick={() => openInNewTab('/descargarPDF_ER')}>Descarga tu PDF "Estado de Resultados"</button>
                            </div>

                            <div className="modal-footer">
                                <button className="btn btn-light" onClick={() => openInNewTab('/descargarPDF_BC')}>Descarga tu PDF "Balance de Comprobación"</button>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </div>        
    );
}

export default Dashboard;