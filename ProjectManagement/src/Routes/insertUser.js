const express = require('express')
const userModel = require('../models/userModel')
const projectModel = require('../models/projectModel')
const BadRequestError = require('../Errors/Bad-Request-Error')
const currentUserMiddleware = require('../Middlewares/currentUser-Middleware')
const UnauthorizedError = require('../Errors/UnAuthorized-Error')

const router = express.Router()

router.post('/insert', currentUserMiddleware, async (req, res, next) => {
    try {
        if (req.currentUser) {
            const { project_id, user_id } = req.body.props
            const currentProject = await projectModel.findById(project_id)
            if (!currentProject) {
                throw new BadRequestError("Project not found")
            } else {
                const listMembers = currentProject.members
                const isExisted = listMembers.findIndex(userId => userId.toString() === user_id)
                if (isExisted === -1) {
                    listMembers.push(user_id)

                    const updatedProject = await projectModel.updateOne(
                        { "_id": project_id },
                        { $set: { "members": listMembers } }
                    )

                    return res.status(200).json({
                        message: "Successfully added user in this project",
                        data: updatedProject
                    })
                }
                return res.status(400).json({
                    message: "User da duoc them vao du an nay"
                })
            }
        } else {
            throw new UnauthorizedError("Authentication failed")
        }
    } catch (error) {
        next(error)
    }
})

module.exports = router