const express = require('express')
const projectModel = require('../models/projectModel')
const currentUserMiddleware = require('../Middlewares/currentUser-Middleware')
const BadRequestError = require('../Errors/Bad-Request-Error')
const router = express.Router()


router.get('/list', async (req, res, next) => {
    try {
        const data = await projectModel
            .find({})
            .populate({
                path: 'category',
                select: ' -__v'
            })
            .populate({
                path: 'creator',
                select: '-__v'
            })
            .populate({
                path: 'members',
                select: '-__v'
            })
            .populate({
                path: 'issues',
                select: '-__v'
            })
        if(data) {
            res.status(200).json({
                message: "Successfully retreive project list",
                data
            })
        }else {
            throw new BadRequestError("Fail to retreive project list")
        }
    } catch (error) {
        next(error)
    }
})

module.exports = router