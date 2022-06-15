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

function Direccionamiento(){

    const [userEmail, setUserEmail] = useState("");
    const [userContraseña, setUserContraseña] = useState("");

    
    useEffect(() => {
        console.log("BUSCANDO DATOS");
        if (window.localStorage.getItem("userEmail")) {
            console.log("VALOR ENCONTRADO EMAIL");
            const emailData = window.localStorage.getItem("userEmail");
            console.log(emailData);
            setUserEmail(JSON.parse(emailData));
        }
        if (window.localStorage.getItem("userContraseña")) {
            console.log("VALOR ENCONTRADO CONTRASEÑA");
            const contraseñaData = window.localStorage.getItem("userContraseña");
            console.log(contraseñaData);
            setUserContraseña(JSON.parse(contraseñaData));
        }
    }, []);
    
    useEffect(() => {
        console.log("imprimiendo info de usuario", userEmail," : ", userContraseña);
        if (userEmail && userContraseña) {
            window.localStorage.setItem('userEmail', JSON.stringify(userEmail));
            window.localStorage.setItem('userContraseña', JSON.stringify(userContraseña));
        } else {
            const emailData = window.localStorage.getItem("userEmail");
            console.log(emailData);
            setUserEmail(JSON.parse(emailData));

            const contraseñaData = window.localStorage.getItem("userContraseña");
            console.log(contraseñaData);
            setUserContraseña(JSON.parse(contraseñaData));
        }
    }, [userEmail, userContraseña]);

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/descargarPDF_BG" element={<PDF_BalanceG   userEmail={userEmail} 
                                                                    userContraseña={userContraseña}/>} />
            <Route path="/descargarPDF_ER" element={<PDF_EstadoR    userEmail={userEmail} 
                                                                    userContraseña={userContraseña}/>} />
            <Route path="/descargarPDF_BC" element={<PDF_BalanceDeC userEmail={userEmail} 
                                                                    userContraseña={userContraseña}/>} />
            <Route path="/login" element={<Login setUserEmail={setUserEmail} setUserContraseña={setUserContraseña} />} />
            <Route path="/registro" element={<Registro />} />
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