const express = require("express")
const commentModel = require("../models/commentModel")
const commentPublisher = require("../nats/comment-publisher")
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const router = express.Router()


router.delete("/delete/:id", currentUserMiddleware, async (req, res, next) => {
    try {
        if(!req.currentUser) {
            throw new UnauthorizedError("Failed authentication")
        }
        const result = await commentModel.deleteOne({ _id: req.params.id })

        //public toi issue service
        commentPublisher({ _id: req.params.id }, "comment:deleted")
        res.status(201).json({
            message: "Successfully deleted comment",
            data: result
        })
    } catch (error) {
        next(error)
    }
})
module.exports = router