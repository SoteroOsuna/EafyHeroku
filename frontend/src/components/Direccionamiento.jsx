import React from "react";
// react router dom
import { Routes, Route } from "react-router-dom";
// paginas
import Home from "./Paginas/Home";
import Registro from "./Paginas/Registro";
import Dashboard from "./Paginas/Dashboard";

function Direccionamiento(){
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
    );   
}


export default Direccionamiento;