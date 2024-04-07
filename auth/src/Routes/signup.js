const express = require("express")
const userModel = require("../models/users")
const BadRequestError = require("../Errors/Bad-Request-Error")
const router = express.Router()
const jwt = require('jsonwebtoken')
const authPublisher = require("../nats/auth-published")

router.post("/signup", async (req, res, next) => {
    try {
        const { username, email, password } = req.body
        const existedUser = await userModel.findOne({
            $or: [
                { email },
                { username }
            ]
        })


        //kiem tra xem user da ton tai hay chua
        if (!existedUser) {
            const newUser = {
                username,
                email,
                password,
                avatar: `https://ui-avatars.com/api/?name=${username}`
            }
            const user = await userModel.create(newUser)
            await user.save()

            //tách từng thuộc tính để gửi lên nats
            const data = {
                _id: user._id,
                username: user.username,
                avatar: user.avatar
            }

            //đăng ký sự kiện publish lên nats
            authPublisher(data, 'auth:created')

            res.status(201).json({
                message: "Successfully created user",
                statusCode: 201,
                data: newUser
            })
        } else {
            throw new BadRequestError("User is already existed")
        }
    } catch (error) {
        next(error)
    }
})

module.exports = router