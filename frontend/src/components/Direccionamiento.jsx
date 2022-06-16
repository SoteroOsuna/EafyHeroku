import { React, useEffect, useState } from "react";
// react router dom
import { Routes, Route } from "react-router-dom";
// paginas
import Home from "./Paginas/Home";
import Registro from "./Paginas/Registro";
import Dashboard from "./Paginas/Dashboard";
import Login from "./Paginas/Login";
import PDF_BalanceG from "./Paginas/PDF_BalanceG";
import PDF_EstadoR from "./Paginas/PDF_EstadoR";
import PDF_BalanceDeC from "./Paginas/PDF_BalanceDeC";
import RequireAuth from "./RequireAuth";
//import { set } from "../../../backend/models/catalogo_Schema";

function Direccionamiento({loggedIn, setLoggedIn, userEmail, setUserEmail, userContraseña, setUserContraseña}){

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/descargarPDF_BG" element={<PDF_BalanceG   userEmail={userEmail} 
                                                                    userContraseña={userContraseña}/>} />
            <Route path="/descargarPDF_ER" element={<PDF_EstadoR    userEmail={userEmail} 
                                                                    userContraseña={userContraseña}/>} />
            <Route path="/descargarPDF_BC" element={<PDF_BalanceDeC userEmail={userEmail} 
                                                                    userContraseña={userContraseña}/>} />
            <Route class={loggedIn? 'hidden' : undefined} path="/login" element={<Login setUserEmail={setUserEmail} setUserContraseña={setUserContraseña} setLoggedIn={setLoggedIn}/>} />
            <Route class={loggedIn? 'hidden' : undefined} path="/registro" element={<Registro setUserEmail={setUserEmail} setUserContraseña={setUserContraseña} />} />
            <Route path="/dashboard" element={<Dashboard userEmail={userEmail} userContraseña={userContraseña} />} />
            {/*
            <Route element={<RequireAuth />}>
                <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            */}
        </Routes>
    );   
}


export default Direccionamiento;