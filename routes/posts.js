const { postValidator, PostModel } = require('../models/post')
const { UserModel } = require('../models/user')
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router();

router.post('/', (req, res) => {

    var post = req.body

    const { joiError } = postValidator(post)
    if (joiError) {
        return res.status(400).send(error)
    }

    new PostModel({
        content: post.content,
        ownerId: post.ownerId
    }).save((err, post) => {
        if (!err) {
            return res.status(201).send(post)
        } else {
            return res.status(400).send(err)
        }
    })

})

router.get('/', async (req, res) => {
    return res.send(await PostModel.find())
})

router.get('/:postId', async (req, res, next) => {

    UserModel.findById(req.params.postId, (error, result) => {
        if (error) {
            next(error)
        } else if (result) {
            res.status(200).json({
                "result": result
            })
        } else {
            res.status(404).json({
                message: `can't find post with id ${req.params.postId}`
            })
        }
    })
})


// router.post('/:postId/upvote', async (req, res) => {
//     const userId = req.body.userId

//     try {
//         if (await PostModel.findById(req.params.postId).findOne({ voters: { $contains: userId } })) {
//             return res.send(PostModel.findByIdAndUpdate({ $inc: { votes: 1 } }))
//         } else {
//             return res.send(PostModel.findByIdAndUpdate({ $inc: { votes: -1 } }))
//         }
//     } catch (error) {
//         console.log(error)
//         res.status(500).send(error)
//     }

// })

module.exports.postsRouter = router