const express = require("express")
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const userModel = require("../models/users")

const router = express.Router()

router.get("/currentuser", currentUserMiddleware,async (req, res) => {
    let currentUser = null
    if(!req.currentUser) {
        req.session = null
        res.clearCookie("session")
    }else {
        const getUserInfo = await userModel.findById(req.currentUser)

        if(getUserInfo !== null) {
            currentUser = {
                id: getUserInfo._id,    
                username: getUserInfo.username,
                email: getUserInfo.email,
                avatar: getUserInfo.avatar,
                project_working: getUserInfo.project_working
            }
        }
    }
    res.status(200).json({ currentUser })
})
module.exports = router