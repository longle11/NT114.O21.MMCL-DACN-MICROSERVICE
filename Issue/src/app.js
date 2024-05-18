const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const cookieSession = require("cookie-session")
const errorHandler = require("./Middlewares/Error-handler")

const app = express()
app.disable('x-powered-by')

app.use(bodyParser.json())

app.use(cors({
    origin: ['https://www.nt533uitjiradev.click', '*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}))

app.set('trust proxy', 1)



app.use(cookieSession({
    signed: false,
    secure: true
}))

app.use('/api/issue', require('./Routes/create'))
app.use('/api/issue', require('./Routes/getIsuue'))
app.use('/api/issue', require('./Routes/delete'))
app.use('/api/issue', require('./Routes/update'))
app.use('/api/issue', require('./Routes/deleteAssignee'))

app.use(errorHandler)


module.exports = app