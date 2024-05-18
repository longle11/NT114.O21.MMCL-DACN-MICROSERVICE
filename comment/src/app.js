const express = require("express")
const bodyParser = require("body-parser")
const cookieSession = require("cookie-session")

const cors = require('cors')
const errorHandler = require("./Middlewares/Error-handler")

const app = express()
app.disable('x-powered-by')

app.set('trust proxy', 1)

app.use(cookieSession({
    signed: false,
    secure: true
}))

app.use(bodyParser.json())
app.use(cors({
    origin: ['https://www.nt533uitjiradev.click, "*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}))

app.use('/api/comments', require("./Routes/create"))
app.use('/api/comments', require("./Routes/update"))
app.use('/api/comments', require("./Routes/delete"))
app.use(errorHandler)


module.exports = app