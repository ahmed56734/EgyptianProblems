const express = require('express')
const app = express()
const mongoose = require('mongoose')
const { usersRouter } = require('./routes/users')
const { postsRouter } = require('./routes/posts')
const path = require('path')

mongoose.connect('mongodb://ahmedali:ahmed22@ds259085.mlab.com:59085/ahmedali')

//middleware
app.use(express.json())

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


//routes
app.use('/api/users', usersRouter)

app.use('/api/posts', postsRouter)


app.use((error, req, res, next) => {
    console.log(error)
    res.status(666).send(error.message)
})

app.listen(3000, () => {
    console.log('listening... ')
})

