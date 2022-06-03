import React, { useEffect, useState } from "react";
import axios from "axios";
import swal from 'sweetalert';

const Swal = require('sweetalert2');

function Dashboard(){

    var prev_result = null;
    var result = null;
    var valid = false;

    var balance = 0;
    const calcularBalance = () => {
        axios.get('/recibirMovimientos').then(resp => {
            const datos = resp.data;
            balance = datos.map(obj => obj.cantidad).reduce((acc, amount) => acc + amount);
            console.log(balance);
            document.getElementById('textoBalance').innerText = balance;

        });
    };

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
    

    return(
        <div className="container micontenedor">
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
                                    <a href="#myModal" className="btn btn-dark btn-lg" data-bs-toggle="modal" role="button">Generar Balance General</a>
                                </div>
                                {/*
                                Modalidad generada al presionar el boton
                                */}
                                <div id="myModal" className="modal fade">
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
                                                        <table>
                                                            <tr>
                                                                <td>Bancos</td>
                                                                <td className="cantidad">6,181.41</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Clientes</td>
                                                                <td className="cantidad">176,780.11</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Deudores Diversos</td>
                                                                <td className="cantidad">95,334.37</td>
                                                            </tr>
                                                            <tr>
                                                                <td>IVA Acreditable</td>
                                                                <td className="cantidad">42,540.61</td>
                                                            </tr>
                                                            <tr>
                                                                <td></td>
                                                                <td> <hr></hr> </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="texto-total"> Total CIRCULANTE</td>
                                                                <td className="cantidad">320,836.50 </td>
                                                            </tr>
                                                        </table>
                                                        <h2 className="subtitulo-seccion"> FIJO</h2>
                                                        <table>
                                                            <tr>
                                                                <td> Mobiliario y Equipo de Oficina</td>
                                                                <td className="cantidad">14,212.06</td>
                                                            </tr>
                                                            <tr>
                                                                <td> Depreciación Acumulada de Mob y E</td>
                                                                <td className="cantidadN">-2,025.00</td>
                                                            </tr>
                                                            <tr>
                                                                <td></td>
                                                                <td> <hr></hr> </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="texto-total"> Total FIJO</td>
                                                                <td className="cantidad"> 12,187.06 </td>
                                                            </tr>
                                                        </table>
                                                        <h2 className="subtitulo-seccion"> DIFERIDO</h2>
                                                        <table>
                                                            <tr>
                                                                <td> Impuestos Anticipados </td>
                                                                <td className="cantidad"> 14,434.00</td>
                                                            </tr>
                                                            <tr>
                                                                <td></td>
                                                                <td> <hr></hr></td>
                                                            </tr>
                                                            <tr>
                                                                <td className="texto-total"> Total DIFERIDO</td>
                                                                <td className="cantidad">14,434.00</td>
                                                            </tr>
                                                        </table>
                                                        
                                                    </div>
                                                    <div className="pasivos-capital">
                                                        <div className="pasivos">
                                                            <h1 className="titulo-seccion"> Pasivos</h1>
                                                            <h2 className="subtitulo-seccion">CIRCULANTE</h2>
                                                            <table>
                                                                <tr>
                                                                    <td> ACREEDORES DIVERSOS</td>
                                                                    <td className="cantidadN"> -343.21</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>IMPUESTOS POR PAGAR</td>
                                                                    <td className="cantidad">78,376.81</td>
                                                                </tr>
                                                                <tr>
                                                                    <td> DOCUMENTOS POR PAGAR </td>
                                                                    <td className="cantidad"> 95,162.67</td>
                                                                </tr>
                                                                <tr>
                                                                    <td> </td>
                                                                    <td> <hr></hr> </td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="texto-total"> Total CIRCULANTE</td>
                                                                    <td className="cantidad"> 173,196.27</td>
                                                                    
                                                                </tr>
                                                            </table>
                                                            <h2 className="subtitulo-seccion"> FIJO</h2>
                                                            <table>
                                                                <tr>
                                                                    <td></td>
                                                                    <td> <hr></hr></td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="texto-total"> Total Fijo </td>
                                                                    <td className="cantidad">0.00</td>
                                                                </tr>
                                                            </table>
                                                            <h2 className="subtitulo-seccion"> DIFERIDO</h2>
                                                            <table>
                                                                <tr>
                                                                    <td></td>
                                                                    <td> <hr></hr></td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="texto-total"> Total DIFERIDO </td>
                                                                    <td className="cantidad">0.00</td>
                                                                </tr>
                                                                <tr>
                                                                <td></td>
                                                                <td> <hr></hr> </td>
                                                                </tr>
                                                            <tr> 
                                                                <td className="texto-suma"> SUMA DEL PASIVO</td>
                                                                <td className="cantidad"> 173, 196.27</td>
                                                            </tr>
                                                            </table>
                                                        </div>
                                                        <div className="capital">
                                                            <h1 className="titulo-seccion">Capital</h1>
                                                            <h2 className="subtitulo-seccion"> CAPITAL </h2>
                                                            <table>
                                                                <tr>
                                                                    <td>Capital Social</td>
                                                                    <td className="cantidad">100,000.00 </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Resultado Ejercicios Anteriores</td>
                                                                    <td className="cantidadN"> -41,370.48 </td>
                                                                </tr>
                                                                <tr>
                                                                    <td> </td>
                                                                    <td> <hr></hr> </td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="texto-total"> Total CAPITAL</td>
                                                                    <td className="cantidad"> 58,629.52</td>
                                                                </tr>
                                                                <tr>
                                                                <td></td>
                                                                <td> <hr></hr> </td>
                                                            </tr>
                                                            <tr> 
                                                                <td className="texto-suma"> SUMA DEL CAPITAL</td>
                                                                <td className="cantidad"> 174,261.29</td>
                                                            </tr>
                                                            </table>
                                                            
                                                    
                                                        </div>
                                                    </div>
                                                </section>
                                                <section className="flex-container">
                                                    <div className="sumas">
                                                        <table>
                                                            <tr>
                                                                <td></td>
                                                                <td> <hr></hr> </td>
                                                            </tr>
                                                            <tr> 
                                                                <td className="texto-suma"> SUMA DEL ACTIVO</td>
                                                                <td className="cantidad"> 347, 457.56</td>
                                                            </tr>
                                                            <tr>
                                                                <td></td>
                                                                <td> <hr></hr> </td>
                                                            </tr>
                                                        </table>
                                                    </div>
                                                    <div className="sumas">
                                                        <table>
                                                            <tr>
                                                                <td></td>
                                                                <td> <hr></hr> </td>
                                                            </tr>
                                                            <tr> 
                                                                <td className="texto-suma"> SUMA PASIVO Y CAPITAL</td>
                                                                <td className="cantidad"> 347, 457.56</td>
                                                            </tr>
                                                            <tr>
                                                                <td></td>
                                                                <td> <hr></hr> </td>
                                                            </tr>
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
                            
                            <div className="row justify-content-center">
                                <div className="col-md-auto">
                                <a href="#myModal1" className="btn btn-dark btn-lg" data-bs-toggle="modal" role="button">Generar Estado de Resultados</a>
                                <div id="myModal1" className="modal fade">
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
                                <div id="myModal2" className="modal fade">
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