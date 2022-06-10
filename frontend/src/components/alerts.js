const Swal = require('sweetalert2');

function existUserErr(){
    Swal.fire({
        icon: 'error',
        title: 'ERROR:',
        text: 'El correo introducido ya ha sido registrado.'
    })
}

function fillErr(){
    Swal.fire({
        icon: 'warning',
        title: 'Advertencia:',
        text: 'Complete todos los campos para continuar'
    })
}

function serverErr(){
    Swal.fire({
        icon: 'error',
        title: 'ERROR:',
        text: 'Sin respuesta del servidor'
    })
}

function passErr(){
    Swal.fire({
        icon: 'error',
        title: 'ERROR:',
        text: 'Contraseña incorrecta'
    })
}

function noUserErr(){
    Swal.fire({
        icon: 'error',
        title: 'ERROR:',
        text: 'El correo introducido no ha sido registrado'
    })
}

function unknownErr(){
    Swal.fire({
        icon: 'error',
        title: 'ERROR:',
        text: 'Ocurrio un error inesperado'
    })
}

function successRegister(){
    Swal.fire({
        icon: 'success',
        title: 'Registro Exitoso!',
        text: 'Ya puede iniciar sesión.'
    })
}

module.exports = { existUserErr, fillErr, serverErr, passErr, noUserErr, unknownErr, successRegister};