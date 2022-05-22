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
                                    <a href="#myModal" class="btn btn-dark btn-lg" data-bs-toggle="modal" role="button">Generar Balance General</a>
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
                                                        <table>
                                                            <tr>
                                                                <td>Bancos</td>
                                                                <td class="cantidad">6,181.41</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Clientes</td>
                                                                <td class="cantidad">176,780.11</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Deudores Diversos</td>
                                                                <td class="cantidad">95,334.37</td>
                                                            </tr>
                                                            <tr>
                                                                <td>IVA Acreditable</td>
                                                                <td class="cantidad">42,540.61</td>
                                                            </tr>
                                                            <tr>
                                                                <td></td>
                                                                <td> <hr></hr> </td>
                                                            </tr>
                                                            <tr>
                                                                <td class="texto-total"> Total CIRCULANTE</td>
                                                                <td class="cantidad">320,836.50 </td>
                                                            </tr>
                                                        </table>
                                                        <h2 class="subtitulo-seccion"> FIJO</h2>
                                                        <table>
                                                            <tr>
                                                                <td> Mobiliario y Equipo de Oficina</td>
                                                                <td class="cantidad">14,212.06</td>
                                                            </tr>
                                                            <tr>
                                                                <td> Depreciación Acumulada de Mob y E</td>
                                                                <td class="cantidadN">-2,025.00</td>
                                                            </tr>
                                                            <tr>
                                                                <td></td>
                                                                <td> <hr></hr> </td>
                                                            </tr>
                                                            <tr>
                                                                <td class="texto-total"> Total FIJO</td>
                                                                <td class="cantidad"> 12,187.06 </td>
                                                            </tr>
                                                        </table>
                                                        <h2 class="subtitulo-seccion"> DIFERIDO</h2>
                                                        <table>
                                                            <tr>
                                                                <td> Impuestos Anticipados </td>
                                                                <td class="cantidad"> 14,434.00</td>
                                                            </tr>
                                                            <tr>
                                                                <td></td>
                                                                <td> <hr></hr></td>
                                                            </tr>
                                                            <tr>
                                                                <td class="texto-total"> Total DIFERIDO</td>
                                                                <td class="cantidad">14,434.00</td>
                                                            </tr>
                                                        </table>
                                                        
                                                    </div>
                                                    <div class="pasivos-capital">
                                                        <div class="pasivos">
                                                            <h1 class="titulo-seccion"> Pasivos</h1>
                                                            <h2 class="subtitulo-seccion">CIRCULANTE</h2>
                                                            <table>
                                                                <tr>
                                                                    <td> ACREEDORES DIVERSOS</td>
                                                                    <td class="cantidadN"> -343.21</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>IMPUESTOS POR PAGAR</td>
                                                                    <td class="cantidad">78,376.81</td>
                                                                </tr>
                                                                <tr>
                                                                    <td> DOCUMENTOS POR PAGAR </td>
                                                                    <td class="cantidad"> 95,162.67</td>
                                                                </tr>
                                                                <tr>
                                                                    <td> </td>
                                                                    <td> <hr></hr> </td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="texto-total"> Total CIRCULANTE</td>
                                                                    <td class="cantidad"> 173,196.27</td>
                                                                    
                                                                </tr>
                                                            </table>
                                                            <h2 class="subtitulo-seccion"> FIJO</h2>
                                                            <table>
                                                                <tr>
                                                                    <td></td>
                                                                    <td> <hr></hr></td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="texto-total"> Total Fijo </td>
                                                                    <td class="cantidad">0.00</td>
                                                                </tr>
                                                            </table>
                                                            <h2 class="subtitulo-seccion"> DIFERIDO</h2>
                                                            <table>
                                                                <tr>
                                                                    <td></td>
                                                                    <td> <hr></hr></td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="texto-total"> Total DIFERIDO </td>
                                                                    <td class="cantidad">0.00</td>
                                                                </tr>
                                                                <tr>
                                                                <td></td>
                                                                <td> <hr></hr> </td>
                                                                </tr>
                                                            <tr> 
                                                                <td class="texto-suma"> SUMA DEL PASIVO</td>
                                                                <td class="cantidad"> 173, 196.27</td>
                                                            </tr>
                                                            </table>
                                                        </div>
                                                        <div class="capital">
                                                            <h1 class="titulo-seccion">Capital</h1>
                                                            <h2 class="subtitulo-seccion"> CAPITAL </h2>
                                                            <table>
                                                                <tr>
                                                                    <td>Capital Social</td>
                                                                    <td class="cantidad">100,000.00 </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Resultado Ejercicios Anteriores</td>
                                                                    <td class="cantidadN"> -41,370.48 </td>
                                                                </tr>
                                                                <tr>
                                                                    <td> </td>
                                                                    <td> <hr></hr> </td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="texto-total"> Total CAPITAL</td>
                                                                    <td class="cantidad"> 58,629.52</td>
                                                                </tr>
                                                                <tr>
                                                                <td></td>
                                                                <td> <hr></hr> </td>
                                                            </tr>
                                                            <tr> 
                                                                <td class="texto-suma"> SUMA DEL CAPITAL</td>
                                                                <td class="cantidad"> 174,261.29</td>
                                                            </tr>
                                                            </table>
                                                            
                                                    
                                                        </div>
                                                    </div>
                                                </section>
                                                <section class="flex-container">
                                                    <div class="sumas">
                                                        <table>
                                                            <tr>
                                                                <td></td>
                                                                <td> <hr></hr> </td>
                                                            </tr>
                                                            <tr> 
                                                                <td class="texto-suma"> SUMA DEL ACTIVO</td>
                                                                <td class="cantidad"> 347, 457.56</td>
                                                            </tr>
                                                            <tr>
                                                                <td></td>
                                                                <td> <hr></hr> </td>
                                                            </tr>
                                                        </table>
                                                    </div>
                                                    <div class="sumas">
                                                        <table>
                                                            <tr>
                                                                <td></td>
                                                                <td> <hr></hr> </td>
                                                            </tr>
                                                            <tr> 
                                                                <td class="texto-suma"> SUMA PASIVO Y CAPITAL</td>
                                                                <td class="cantidad"> 347, 457.56</td>
                                                            </tr>
                                                            <tr>
                                                                <td></td>
                                                                <td> <hr></hr> </td>
                                                            </tr>
                                                        </table>
                                                    </div>
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