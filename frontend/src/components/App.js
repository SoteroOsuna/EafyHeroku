import { React, useEffect, useState } from "react";
// react router dom
import { BrowserRouter as Router } from "react-router-dom";
import Direccionamiento from "./Direccionamiento";
import Header from "./partials/Header";
import Footer from "./partials/Footer";


function App(){
    document.title = "Eafy Heroku"
    const [loggedIn, setLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [userContraseña, setUserContraseña] = useState("");

    
    useEffect(() => {
        console.log("BUSCANDO DATOS");
        if (window.localStorage.getItem("userEmail") && window.localStorage.getItem("userContraseña")) {
            console.log("VALOR ENCONTRADO EMAIL");
            const emailData = window.localStorage.getItem("userEmail");
            console.log(emailData);
            setUserEmail(JSON.parse(emailData));
            console.log("VALOR ENCONTRADO CONTRASEÑA");
            const contraseñaData = window.localStorage.getItem("userContraseña");
            console.log(contraseñaData);
            setUserContraseña(JSON.parse(contraseñaData));
            console.log("imprimeindo loggedin", loggedIn);
        } else {
            setUserEmail(null);
            setUserContraseña(null);
            console.log("imprimeindo loggedin", loggedIn);
        }
    }, []);
    
    useEffect(() => {
        console.log("imprimiendo info de usuario", userEmail," : ", userContraseña);
        if (userEmail && userContraseña) {
            window.localStorage.setItem('userEmail', JSON.stringify(userEmail));
            window.localStorage.setItem('userContraseña', JSON.stringify(userContraseña));
        } else {
            /*
            const emailData = window.localStorage.getItem("userEmail");
            console.log(emailData);
            setUserEmail(JSON.parse(emailData));

            const contraseñaData = window.localStorage.getItem("userContraseña");
            console.log(contraseñaData);
            setUserContraseña(JSON.parse(contraseñaData));
            */
        }
    }, [userEmail, userContraseña]);

    useEffect(() => {
        setLoggedIn(JSON.parse(window.localStorage.getItem('loggedIn')));
        console.log("imprimiendo loggedIn", loggedIn);
    }, []);
    
    useEffect(() => {
        window.localStorage.setItem('loggedIn', loggedIn);
        console.log("imprimendo loggedIn", loggedIn)
    }, [loggedIn]);

    const logOut = () => {
        setLoggedIn(false);
        setUserEmail("");
        setUserContraseña("");
        window.localStorage.setItem('userEmail', "");
        window.localStorage.setItem('userContraseña', "");
    }
      

    return (
        <Router>
            <div>
                <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} logOut={logOut}/>
                    <Direccionamiento loggedIn={loggedIn} setLoggedIn={setLoggedIn}
                                        userEmail={userEmail} setUserEmail={setUserEmail}
                                        userContraseña={userContraseña} setUserContraseña={setUserContraseña}
                                        />
                <Footer loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
            </div>
        </Router>
    );
}

export default App;