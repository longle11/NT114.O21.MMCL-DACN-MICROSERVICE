const express = require("express")
const commentModel = require("../models/commentModel")
const commentPublisher = require("../nats/comment-publisher")
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const router = express.Router()


router.put("/update/:id", currentUserMiddleware, async (req, res, next) => {
    try {
        if(!req.currentUser) {
            throw new UnauthorizedError("Failed authentication")
        }
        const result = await commentModel.updateOne({ _id: req.params.id }, { content: req.body.content, timeStamp: req.body.timeStamp, isModified: true })
        //public toi issue service
        commentPublisher({ _id: req.params.id, content: req.body.content, timeStamp: req.body.timeStamp, isModified: true }, "comment:updated")
        res.status(201).json({
            message: "Successfully updated this comment",
            data: result
        })
    } catch (error) {
        next(error)
    }
})
module.exports = router