const mongoose = require("mongoose")
const Joi = require("Joi")

const User = mongoose.model("User", new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true },
    }
));

const joiSchema = {
    name: Joi.string().required(),
    email: Joi.string().required()
}

function validateUser (user){
    return Joi.validate(user, joiSchema)
}

module.exports.UserModel = User
module.exports.userValidator = validateUser