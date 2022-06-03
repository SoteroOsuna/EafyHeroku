import React, {useState} from "react";
import axios from "axios";
import  { Redirect } from 'react-router-dom'
const Swal = require('sweetalert2');

function Login(){

    // declaración objeto inicial
    const[input, setInput] = useState ({
        email: "",
        contraseña: ""
    });

    // cambiar el valor por el que escribe el usuario
    function handleChange(event){
        const {name, value} = event.target;
        // guardar el valor previo.
        setInput(prevInput => {
            return {
                ...prevInput,
                [name]: value
            }
        });
    }

    async function validateUsuario(nUsuario){
        const result = await axios.post("/login", nUsuario);
        console.log(result);
        const status = result.status
        console.log(status);

        if (status===200){
            Swal.fire(
                'Login exitoso!',
                'success'
            )
            
        }
        if (status===201){
            Swal.fire({
                icon: 'error',
                title: 'ERROR:',
                text: 'Usuario no encontrado!'
            })
        }
        if (status===202){
            Swal.fire({
                icon: 'error',
                title: 'ERROR:',
                text: 'Contraseña incorrecta!'
            })
        }
        
    }

    // se activa cuando se oprime el botón
    function handleClick(event){
        // evita el parpadeo predefinido
        event.preventDefault();
        
        const nUsuario = {
            email: input.email,
            contraseña: input.contraseña
        }

        validateUsuario(nUsuario)
        
    }

    
    
    return (
        <div className="container micontenedor">
            <h1>Login</h1>
            <p>A continuación, puedes iniciar sesión aquí!</p>

            <main className="form-signin">
                <form>
                    <div className="form-floating">
                        <input
                            onChange={handleChange}
                            name="email"
                            value={input.email}
                            type="email"
                            className="form-control"
                            id="floatingInput"
                            placeholder="name@example.com"
                            required />
                            
                        <label for="floatingInput">Email address</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input
                            onChange={handleChange}
                            name="contraseña"
                            value={input.contraseña}
                            type="password"
                            className="form-control"
                            id="floatingPassword"
                            placeholder="Password"
                            required />
                        <label for="floatingPassword">Password</label>
                    </div>

                    <button onClick={handleClick} className="w-100 btn btn-lg btn-primary" type="submit">Login</button>
                    <p className="mt-5 mb-3 text-muted">&copy; 2022 Eafy Solutions</p>
                </form>
            </main>

        </div>
    );


}

export default Login;