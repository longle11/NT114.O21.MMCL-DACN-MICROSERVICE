const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const cookieSession = require("cookie-session")
const errorHandler = require("./Middlewares/Error-handler")
const { Server } = require('socket.io')

const app = express()
app.disable('x-powered-by')

app.use(cors({
    origin: ['https://www.nt533uitjiradev.click'],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}))

const io = new Server({
    cors: {
        origin: "*"
    }
})

io.on("connection", (socket) => {
    console.log(socket);

    socket.on("disconnect", () => {
        console.log("Someone has left");
    })
})

app.use(bodyParser.json())

app.set('trust proxy', 1)

app.use(cookieSession({
    signed: false,
    secure: true
}))

app.use('/api/projectmanagement', require("./Routes/create"))
app.use('/api/projectmanagement', require("./Routes/getList"))
app.use('/api/projectmanagement', require("./Routes/listUser"))
app.use('/api/projectmanagement', require("./Routes/insertUser"))
app.use('/api/projectmanagement', require("./Routes/update"))
app.use('/api/projectmanagement', require("./Routes/delete"))
app.use('/api/projectmanagement', require("./Routes/getProject"))
app.use('/api/projectmanagement', require("./Routes/insertIssue"))
app.use('/api/projectmanagement', require("./Routes/deleteUser"))
app.use(errorHandler)

module.exports = app
