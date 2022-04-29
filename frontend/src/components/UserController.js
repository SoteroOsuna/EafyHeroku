const bcrypt = require('bcryptjs');
const Usuario = require('./User')

const loginCtrl = async (req, res) => {
    try{
        const {email, contraseña} = req.body
        const user = await Usuario.findOne({email})

        if(!user){
            res.status(404)
            res.send({ error: 'Usuario no encontrado' })
            return
        }

        const checkPassword = bcrypt.compare(contraseña, user.contraseña)

        if (checkPassword){
            res.status(200)
            res.send('Login exitoso')
            return
        }

        if(!checkPassword){
            res.status(409)
            res.send({
                error: 'Contraseña Invalida'
            })
            return
        }
    }
    catch(e){
        res.status(500)
        res.send({
            error: 'Error interno del servidor'
        })
    }
}

