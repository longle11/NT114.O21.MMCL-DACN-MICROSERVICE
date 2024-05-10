const express = require("express")
const commentModel = require("../models/commentModel")
const commentPublisher = require("../nats/comment-publisher")
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const UnauthorizedError = require('../Errors/UnAuthorized-Error')
const router = express.Router()
const { check, validationResult } = require('express-validator');


router.post("/create", currentUserMiddleware, [
    check('issueId')
        .custom(id => id.toString().length > 5).withMessage('issueId is invalid ObjectId'),
    check('creator')
        .custom(id => id.toString().length > 5).withMessage('creator is invalid ObjectId')
], async (req, res, next) => {
    try {
        if (!req.currentUser) {
            throw new UnauthorizedError("Failed authentication")
        }
        if (!validationResult(req).isEmpty()) {
            throw new BadRequestError('Information is invalid')
        }
        const { issueId, creator, content } = req.body
        const comment = new commentModel({ issueId, creator, content });
        const result = await comment.save();
        //public toi issue service
        commentPublisher("comment:created", result)
        res.status(201).json({
            message: "Successfully created comment",
            data: result
        })
    } catch (error) {
        next(error)
    }
})
module.exports = router