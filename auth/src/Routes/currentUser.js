const express = require("express")
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")


const router = express.Router()

router.get("/currentuser", currentUserMiddleware, (req, res) => {
    res.status(200).send({ currentUser: req.currentUser || null })
})
module.exports = router