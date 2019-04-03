const express = require('express')
const app = express()
const mongoose = require('mongoose')
const {usersRouter} = require('./routes/users')
const {postsRouter} = require('./routes/posts')

mongoose.connect('mongodb://ahmedali:ahmed22@ds259085.mlab.com:59085/ahmedali')

//middleware
app.use(express.json())


//routes
app.use('/api/users', usersRouter)

app.use('/api/posts', postsRouter)

app.listen(3000, ()=>{
    console.log('listening... ')
})