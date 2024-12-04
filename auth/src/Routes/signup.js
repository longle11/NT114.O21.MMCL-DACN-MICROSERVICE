const express = require("express")
const userModel = require("../models/users")
const BadRequestError = require("../Errors/Bad-Request-Error")
const router = express.Router()
const bcrypt = require("bcrypt")
const sendEmail = require("../Utils/email")
const UnauthorizedError = require("../Errors/UnAuthorized-Error")
const crypto = require('crypto')
const { log } = require("console")
const authPublisher = require("../nats/publisher/auth-published")
// router.post("/signup", async (req, res, next) => {
//     try {
//         const { username, email, password } = req.body
//         const existedUser = await userModel.findOne({email})

//         //kiem tra xem user da ton tai hay chua
//         if (!existedUser) {
//             const newUser = {
//                 username,
//                 email,
//                 password,
//                 avatar: `https://ui-avatars.com/api/?name=${username}`
//             }
//             //temporary store user registration information
//             if(password !== null) {
//                 const salt = bcrypt.genSaltSync(10)
//                 newUser.password = bcrypt.hashSync(newUser.password, salt)
//             }
//             const user = await userModel.create(newUser)
//             await user.save()


//             //tách từng thuộc tính để gửi lên nats
//             const data = {
//                 _id: user._id,
//                 username: user.username,
//                 avatar: user.avatar
//             }

//             // đăng ký sự kiện publish lên nats
//             authPublisher(data, 'auth:created')

//             res.status(201).json({
//                 message: "Successfully created user",
//                 statusCode: 201,
//                 data: newUser
//             })
//         } else {
//             throw new BadRequestError("User is already existed")
//         }
//     } catch (error) {
//         next(error)
//     }
// })

const sendTokenToEmail = async (id) => {
    const currentUser = await userModel.findById(id)
    try {
        const getToken = await currentUser.generateToken()
        await currentUser.save()

        const token = getToken
        const message = `Input token to verify your information: ${token}`

        await sendEmail({
            email: currentUser.email,
            subject: "Token",
            notify: message
        })

        return {
            message: "Please check your email",
            statusCode: 200,
            id: currentUser._id.toString()
        }
    } catch (error) {
        currentUser.token = null
        currentUser.tokenExp = null
        await currentUser.save()

        return {
            message: "Failed to send email, please try again",
            statusCode: 400,
            id: null
        }
    }
}

router.post("/signup", async (req, res, next) => {
    try {
        const { username, email, password } = req.body
        const existedUser = await userModel.findOne({ email })
        //kiem tra xem user da ton tai hay chua
        if (!existedUser) {
            const newUser = {
                username,
                email,
                password,
                avatar: `https://ui-avatars.com/api/?name=${username}`
            }
            //temporary store user registration information
            if (password !== null) {
                const salt = bcrypt.genSaltSync(10)
                newUser.password = bcrypt.hashSync(newUser.password, salt)
            } else {
                //day la dang ky bang gmail
                newUser.status = "approved"
                const data = {
                    _id: newUser._id,
                    username: newUser.username,
                    avatar: newUser.avatar
                }
                //đăng ký sự kiện publish lên nats
                authPublisher(data, 'auth:created')
            }
            const user = await userModel.create(newUser)

            const getMessage = await sendTokenToEmail(user._id.toString())

            if (getMessage.statusCode === 400) {
                return res.status(400).json({
                    message: getMessage.message,
                    statusCode: 400
                })
            } else {
                return res.status(200).json({
                    message: getMessage.message,
                    statusCode: 200,
                    data: user._id
                })
            }
        } else {
            throw new BadRequestError("User is already existed")
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
})

router.post('/token/:id', async (req, res, next) => {
    try {
        const userId = req.params.id
        const token = req.body.id

        const currentUser = await userModel.findById(userId)
        if (currentUser) {
            const hashToken = crypto
                .createHash('sha256')
                .update(token)
                .digest('hex')

            const checkTokenExistedOrExpired = await userModel.findOne({
                token: hashToken,
                tokenExp: { $gt: Date.now() }
            })

            if (checkTokenExistedOrExpired) {
                currentUser.status = "approved"
                currentUser.token = null
                currentUser.tokenExp = null
                currentUser.save()
                //tách từng thuộc tính để gửi lên nats
                const data = {
                    _id: currentUser._id,
                    username: currentUser.username,
                    avatar: currentUser.avatar,
                    email: currentUser.email
                }
                //đăng ký sự kiện publish lên nats
                authPublisher(data, 'auth:created')
                return res.status(201).json({
                    message: "Successfully registration",
                    sttausCode: 201,
                    data: currentUser
                })
            } else {
                throw new BadRequestError("Token is invalid or expired")
            }

        } else {
            throw new UnauthorizedError("User is not existed")
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
})

router.get('/token/:id', async (req, res, next) => {
    try {
        const userId = req.params.id
        const getMessage = await sendTokenToEmail(userId)
        if (getMessage.statusCode === 400) {
            res.status(400).json({
                message: getMessage.message,
                statusCode: 400
            })
        } else {
            res.status(200).json({
                message: getMessage.message,
                statusCode: 200
            })
        }

    } catch (error) {
        next(error)
    }
})


module.exports = router