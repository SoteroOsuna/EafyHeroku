import { React, useState } from "react";
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

function Direccionamiento(){

    const [userData, setUserData] = useState({
        email: "",
        contraseña: ""
    });

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/descargarPDF_BG" element={<PDF_BalanceG />} />
            <Route path="/descargarPDF_ER" element={<PDF_EstadoR />} />
            <Route path="/descargarPDF_BC" element={<PDF_BalanceDeC />} />
            <Route path="/login" element={<Login setUserData={setUserData} />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/dashboard" element={<Dashboard userData={userData} />} />
            {/*
            <Route element={<RequireAuth />}>
                <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            */}
        </Routes>
    );   
}


export default Direccionamiento;