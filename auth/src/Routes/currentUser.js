const express = require("express")
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")

const router = express.Router()

router.get("/currentuser", currentUserMiddleware, (req, res) => {
    if(!req.currentUser) {
        req.session = null
        res.clearCookie("session")
    }
    res.status(200).send({ currentUser: req.currentUser })
})
module.exports = router