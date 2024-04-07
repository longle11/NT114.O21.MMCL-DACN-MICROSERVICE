const express = require("express")
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const UnauthorizedError = require("../Errors/UnAuthorized-Error")
const BadRequestError = require("../Errors/Bad-Request-Error")

const router = express.Router()
router.put("/comments/insert/:id", currentUserMiddleware, async (req, res, next) => {
    try {
        if (req.currentUser) {
            const { id } = req.params.id
            const commentId = req.body
            const currentIssue = await issueModel.findById(id)
            if (!currentIssue) {
                throw new BadRequestError("Issue not found")
            } else {

                let comments = currentIssue.comments

                comments.push(commentId)

                const data = await issueModel.updateOne({ _id: id }, { $set: { comments: comments } })
                return res.status(200).json({
                    message: "Successfully added user",
                    data: data
                })
            }
        } else {
            throw new UnauthorizedError("Authentication failed")
        }
    } catch (error) {
        next(error)
    }
})

module.exports = router;