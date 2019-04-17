const { userValidator, UserModel, loginBodyValidator } = require('../models/user')
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const authMiddlewareFunc = require('../middleware/auth')
const uuid = require('uuid4');
const path = require('path')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/users')
    },

    filename: function (req, file, cb) {
        cb(null, uuid() + path.extname(file.originalname));
    }
})

const multerUploader = multer({
    storage: storage
})


router.post('/signup', multerUploader.single('userImage'), async (req, res, next) => {
    let user = req.body;
    console.log(user)
    const { joiError } = userValidator(user);

    if (joiError) {
        return res.status(400).send(joiError);
    }

    try {
        const users = await UserModel.find({ email: user.email })
        console.log(`users length ${users.length}`)

        if (users.length >= 1) {
            res.status(401).json({
                message: "this email already taken"
            });
            return;
        } else {
            user = new UserModel({
                name: user.name,
                email: user.email,
                password: await bcrypt.hash(user.password, 10).catch(err => console.log(err)),
                imageUrl: req.host + ':3000/' + req.file.path
            });

            const error = user.validateSync()

            if (!error) {
                await user.save()
                return res.status(201).json({
                    message: "user created"
                })
            } else {
                return res.status(400).send(error)
            }
        }

    } catch (error) {
        next(error)
    }



})

router.post('/login', async (req, res, next) => {

    try {
        const { joiError } = loginBodyValidator(req.body)
        console.log('joyerrors ', joiError)
        if (joiError || !req.body.email || !req.body.password) {
            console.log('joi error')
            return res.status(400).json({
                message: "email and password are required"
            })
        }

        const users = await UserModel.find({ email: req.body.email })

        if (users.length == 0) {
            res.status(401).json({
                message: "Auth failed"
            })
            return;
        } else {
            const user = users[0]
            console.log(`user ${user}`)
            if (bcrypt.compareSync(req.body.password, user.password)) {
                const token = await jwt.sign(
                    {
                        email: user.email,
                        userId: user._id
                    },
                    process.env.JWT_KEY
                );
                console.log(`token ${token}`)
                return res.status(200).json({
                    message: "Auth successful",
                    token: token
                });
            } else {
                res.status(401).json({
                    message: "Auth failed - wrong password"
                })
                return;
            }
        }
    } catch (error) {
        next(error)
    }




})

router.get('/', async (req, res) => {
    const allUsers = await UserModel.find().select('_id name email imageUrl');
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

router.delete('/:id', authMiddlewareFunc, (req, res, next) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({
            message: `can't find user with id ${req.params.id}`
        })
    }

    UserModel.findByIdAndDelete(req.params.id, (err, user) => {
        if (err) {
            next(err)
        } else if (user) {
            res.status(200).json({
                message: "user deleted"
            })
        } else {
            return res.status(404).json({
                message: `can't find user with id ${req.params.id}`
            })
        }
    })
})


module.exports.usersRouter = router