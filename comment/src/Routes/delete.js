const express = require("express")
const commentModel = require("../models/commentModel")
const commentPublisher = require("../nats/comment-publisher")
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const UnauthorizedError = require("../Errors/UnAuthorized-Error")
const BadRequestError = require("../Errors/Bad-Request-Error")
const router = express.Router()


router.delete("/delete/:id", currentUserMiddleware, async (req, res, next) => {
    try {
        if (!req.currentUser) {
            throw new UnauthorizedError("Failed authentication")
        }
        const commentIds = await commentModel.find({})
        const ids = commentIds.map(comment => comment._id.toString());
        if (ids.includes(req.params.id)) {
            const result = await commentModel.deleteOne({ _id: req.params.id })

            //public toi issue service
            commentPublisher("comment:deleted", { _id: req.params.id })
            res.status(200).json({
                message: "Successfully deleted comment",
                data: result
            })
        } else {
            throw new BadRequestError("ID is invalid")
        }

    } catch (error) {
        next(error)
    }
})
module.exports = router