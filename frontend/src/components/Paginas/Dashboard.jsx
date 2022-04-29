import React, { useEffect, useState } from "react";
import * as XLSX from 'xlsx';
import axios from "axios";

function Dashboard(){
    const [items, setItems] = useState([]);
    // To display selected fileName
    const [fileName, setFileName] = useState(null);

    const[input, setInput] = useState ({
        item: "",
        description: "",
        um: "",
        productCode: ""
    });

    var balance = 0;
    const calcularBalance = () => {
        axios.get('/recibirMovimientos').then(resp => {
            const datos = resp.data;
            balance = datos.map(obj => obj.cantidad).reduce((acc, amount) => acc + amount);
            console.log(balance);
            document.getElementById('textoBalance').innerText = balance;

        });
    };

    const readExcel = (file) => {
        const promise = new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file)

            fileReader.onload = (event) => {
                const bufferArray = event.target.result;
                
                // To display selected fileName
                setFileName(file.name);
                
                const workbook = XLSX.read(bufferArray, {type:'buffer'});
                const wsname = workbook.SheetNames[0];

                const worksheet = workbook.Sheets[wsname];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
 
                resolve(jsonData);
            };

            fileReader.onerror = (error) => {
                reject(error);
            };
        });

        promise.then((d) => {
            console.log(d);
            setItems(d);
        });
    }

    return(
        <div className="container micontenedor">
                <h1>Dashboard</h1>
                <div class="container">
                    <div class="row justify-content-around">
                        <div class="col">
                            <div class="row align-items-center">
                                <h1 class="text-center"> Registro de Archivos</h1>
                            </div>
                            <div class="row justify-content-center">
                                <div class="col-md-auto">
                                    <form action="/subirExcel" method="POST" enctype="multipart/form-data">
                                        <div class="form-group">
                                            <label for="excel">BrowseFile</label>
                                            <input type="file" class="form-control" name="excel" required></input>
                                            <br></br><br></br>
                                            <div class="row justify-content-center">
                                                <div class="col-md-auto">
                                                    <input class="btn btn-dark btn-lg" type="submit" value="Subir Excel"></input>
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
                                    <a href="#myModal" class="btn btn-dark btn-lg" data-bs-toggle="modal" role="button" onClick={calcularBalance}>Generar Reporte 1</a>
                                </div>
                                <div id="myModal" class="modal fade">
                                    <div class="modal-dialog">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                            <p class="modal-title">Tu Balance es:</p>
                                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                            </div>
                                            <div class="modal-body">
                                                <h5 class="modal-title" id="textoBalance">$+{balance}</h5>
                                                <p class="text-secondary"><small>Si existe algun error favor de comunicarse con soporte tecnico</small></p>
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
                                    <button class="btn btn-dark btn-lg">Generar Reporte 2</button>
                                </div>
                            </div>
                            <div class="row justify-content-center">
                                <div class="col-md-auto">
                                    <button class="btn btn-dark btn-lg">Generar Reporte 3</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>        
        </div>
    );
}

export default Dashboard;