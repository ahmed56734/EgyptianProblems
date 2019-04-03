const mongoose = require('mongoose')
const Joi = require('joi')
const { UserModel } = require('./user')

const ownerIdSchema = {
    type: String,
    required: true,
    validate: {
        validator: async function (id) {
            return await UserModel.findById(id)
        },
        message: 'user id doesn\'t exist'
    }
}

const Post = mongoose.model("Post", new mongoose.Schema(
    {
        content: { type: String, required: true },
        ownerId: ownerIdSchema,
        votes: {
            type: Number,
            default: 0,
            get: (value) => { return value < 0 ? 0 : value }
        },
        comments: [
            {
                content: { type: String, required: true },
                ownerId: ownerIdSchema
            }
        ],
        voters: [String]
    }
));

function validatePost(post) {
    return Joi.validate(post, {
        content: Joi.string().required(),
        ownerId: Joi.string().required()
    })
}

module.exports.PostModel = Post
module.exports.postValidator = validatePost