import React from "react";
// react router dom
import { Routes, Route } from "react-router-dom";
// paginas
import Home from "./Paginas/Home";
import Registro from "./Paginas/Registro";

function Direccionamiento(){
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/registro" element={<Registro />} />
        </Routes>
    );   
}


export default Direccionamiento;