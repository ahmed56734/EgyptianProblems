const { userValidator, UserModel } = require('../models/user')
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router();


router.post('/', async (req, res) => {
    let user = req.body;
    const { joiError } = userValidator(user);

    if (joiError) {
        return res.status(400).send(joiError);
    }

    user = new UserModel({
        name: user.name,
        email: user.email
    });

    const error = user.validateSync()
    if (!error) {
        return res.send(await user.save());
    } else {
        return res.status(400).send(error)
    }

})

router.get('/', async (req, res) => {
    const allUsers = await UserModel.find();
    res.send(allUsers)
})

router.get('/:id', async (req, res) => {

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).send(`can't find user with id ${req.params.id}`)
        }

        const user = await UserModel.findById(req.params.id)
        if (user) {
            return res.send(user)
        } else {
            return res.status(404).send(`cant find user with id {req.params.id}`)
        }

    } catch (error) {
        console.log(error)
        res.status(500).end()
    }

})

router.put('/:id', async (req, res) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).send(`can't find user with id ${req.params.id}`)
    }

    const newUser = req.body
    const validationResult = userValidator(newUser);

    if (validationResult.error) {
        return res.send(validationResult.error)
    }

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(req.params.id, {
            name: newUser.name,
            email: newUser.email
        })
        if (updatedUser) {
            return res.send(updatedUser)
        } else {
            return res.status(404).send(updatedUser)
        }
    } catch (error) {
        console.log(error)
        res.status(500).end()
    }
})


module.exports.usersRouter = router