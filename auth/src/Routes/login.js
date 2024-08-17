const express = require("express")
const userModel = require("../models/users")
const router = express.Router()
const UnauthorizedError = require('../Errors/UnAuthorized-Error')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const BadRequestError = require("../Errors/Bad-Request-Error")
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body
        const currentUser = await userModel.findOne({ email })
        if (currentUser) {
            if (currentUser.password !== null) {    //kiem tra xem day la dang nhap bang nhap tai khoan hay gmail
                const checkPassword = await bcrypt.compare(password, currentUser.password)
                if (checkPassword) {
                    if (currentUser.status !== "pending") {
                        const userId = currentUser.id
                        //khởi tạo jwt
                        const userJwt = jwt.sign({
                            id: userId
                        }, process.env.JWT_KEY, { expiresIn: '3h' })

                        //luu tru jwt trong cookie
                        req.session = {
                            jwt: userJwt
                        }
                        return res.status(200).json({
                            message: "Login Success",
                            data: userId,
                            statusCode: 200
                        })
                    } else {
                        return res.status(400).json({
                            message: "Your account has not been approved yet, please enter the token to activate your account",
                            statusCode: 400,
                            userId: currentUser._id.toString()
                        })
                    }
                }
            } else {    //phan nay la cua dang nhap bang gmail
                if (password === null) {
                    const userId = currentUser.id
                    //khởi tạo jwt
                    const userJwt = jwt.sign({
                        id: userId
                    }, process.env.JWT_KEY, { expiresIn: '3h' })

                    //luu tru jwt trong cookie
                    req.session = {
                        jwt: userJwt
                    }
                    return res.status(200).json({
                        message: "Login Success",
                        data: userId,
                        statusCode: 200
                    })
                }
            }
        }
        throw new UnauthorizedError("Authentication failed")
    } catch (error) {
        next(error)
    }
})

module.exports = router
