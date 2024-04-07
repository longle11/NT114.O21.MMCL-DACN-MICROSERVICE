const express = require("express")
const commentModel = require("../models/commentModel")
const commentPublisher = require("../nats/comment-publisher")
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const UnauthorizedError = require('../Errors/UnAuthorized-Error')
const router = express.Router()


router.post("/create", currentUserMiddleware, async (req, res, next) => {
    try {
        if(!req.currentUser) {
            throw new UnauthorizedError("Failed authentication")
        }
        const result = await commentModel.create(req.body);
        //public toi issue service
        await commentPublisher(result, "comment:created")
        res.status(201).json({
            message: "Successfully created comment",
            data: result
        })
    } catch (error) {
        next(error)
    }
})
module.exports = router