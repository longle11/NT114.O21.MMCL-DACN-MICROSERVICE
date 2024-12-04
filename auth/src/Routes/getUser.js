const express = require("express")
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const userModel = require("../models/users")

const router = express.Router()

router.get("/findUser", async (req, res) => {
    const getUserInfo = await userModel.find({ email: req.query.keyword })
    
    if (getUserInfo.length !== 0) {
        return res.status(200).json({
            message: "Get successfully the user",
            data: getUserInfo[0]
        })
    }

    return res.status(400).json({
        message: "User does not found",
        data: null
    })

})
module.exports = router