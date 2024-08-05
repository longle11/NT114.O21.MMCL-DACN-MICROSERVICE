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
            if (password !== null) {
                const checkPassword = await bcrypt.compare(password, currentUser.password)
                if (checkPassword) {
                    const userId = currentUser.id
                    //khởi tạo jwt
                    const userJwt = jwt.sign({
                        id: userId
                    }, process.env.JWT_KEY, { expiresIn: '3h' })

                    //luu tru jwt trong cookie
                    req.session = {
                        jwt: userJwt
                    }
                    res.status(200).json({
                        message: "Login Success",
                        data: userId,
                        statusCode: 200
                    })
                } else {
                    throw new UnauthorizedError("Authentication failed")
                }
            } else {
                const userId = currentUser.id
                //khởi tạo jwt
                const userJwt = jwt.sign({
                    id: userId
                }, process.env.JWT_KEY, { expiresIn: '3h' })

                //luu tru jwt trong cookie
                req.session = {
                    jwt: userJwt
                }
                res.status(200).json({
                    message: "Login Success",
                    data: userId,
                    statusCode: 200
                })
            }
        } else {
            throw new UnauthorizedError("Authentication failed")
        }
    } catch (error) {
        next(error)
    }
})

module.exports = router
