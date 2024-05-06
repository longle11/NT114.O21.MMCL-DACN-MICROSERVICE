const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const errorHandler = require("./Middlewares/Error-handler")
const cookieSession = require('cookie-session')
const app = express()

app.use(cors())
app.use(bodyParser.json())

app.set('trust proxy', 1) // trust first proxy

app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
}))


app.use('/api/users', require('./Routes/signup'))
app.use('/api/users', require('./Routes/login'))
app.use('/api/users', require('./Routes/currentUser'))
app.use('/api/users', require('./Routes/logout'))


app.use(errorHandler)

module.exports = app