const mongoose = require("mongoose")
const Joi = require("Joi")

const User = mongoose.model("User", new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: [true, 'password is required '] }
    }
));



function validateUser(user) {
    const joiSchema = {
        name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required()
    }
    return Joi.validate(user, joiSchema)
}

function validateLoginBody(body) {
    console.log('body ',body)
    const joiSchema = {
        email: Joi.string().required(),
        password: Joi.string().required()
    }
    return Joi.validate(body, joiSchema)
}

module.exports.UserModel = User
module.exports.userValidator = validateUser
module.exports.loginBodyValidator = validateLoginBody