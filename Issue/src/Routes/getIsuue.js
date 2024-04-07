const express = require("express")
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const issueModel = require('../models/issueModel')
const BadRequestError = require("../Errors/Bad-Request-Error")
const router = express.Router()

router.get("/:id", currentUserMiddleware, async (req, res, next) => {
    try {
        const { id } = req.params

        const issue = await issueModel.findById(id)
            .populate({
                path: 'creator',
                select: '-__v'
            })
            .populate({
                path: 'assignees',
                select: '-__v'
            })
            .populate({
                path: 'comments',
                select: '-__v',
                populate: ({
                    path: 'creator',
                    select: '-__v'
                }),
                options: {
                    sort: { timeStamp: -1 }
                }
            })

        if (issue) {
            return res.status(200).json({
                message: "Successfully retrieve the issue",
                data: issue
            })
        } else {
            throw new BadRequestError("Issue not found")
        }
    } catch (error) {
        next(error)
    }

})


module.exports = router;