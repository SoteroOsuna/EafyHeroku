import React, { useEffect, useState } from "react";
import axios from "axios";

function Dashboard(){

    var balance = 0;
    const calcularBalance = () => {
        axios.get('/recibirMovimientos').then(resp => {
            const datos = resp.data;
            balance = datos.map(obj => obj.cantidad).reduce((acc, amount) => acc + amount);
            console.log(balance);
            document.getElementById('textoBalance').innerText = balance;

        });
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
                                                <h5 class="modal-title" id="textoBalance">{balance}</h5>
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