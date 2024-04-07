const express = require("express")
const userModel = require("../models/users")
const router = express.Router()
const UnauthorizedError = require('../Errors/UnAuthorized-Error')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body

        const currentUser = await userModel.findOne({ email })
        if (currentUser) {
            const checkPassword = bcrypt.compare(currentUser.password, password)

            if (checkPassword) {
                //khởi tạo jwt
                const userJwt = jwt.sign({
                    id: currentUser.id,
                    email: currentUser.email,
                    avatar: currentUser.avatar,
                    username: currentUser.username
                }, process.env.JWT_KEY)

                //luu tru jwt trong cookie
                req.session = {
                    jwt: userJwt
                }

                res.status(200).json({
                    message: "Login Success",
                    data: currentUser,
                    statusCode: 200
                })
            } else {
                throw new UnauthorizedError("Authentication failed")
            }
        } else {
            throw new UnauthorizedError("Authentication failed")
        }
    } catch (error) {
        next(error)
    }
})

module.exports = router
