const express = require('express')
const projectModel = require('../models/projectModel')
const projectManagementPublisher = require('../nats/publisher/projectmanagement-publisher')
const issueModel = require('../models/issueModel')
const currentUserMiddleware = require('../Middlewares/currentUser-Middleware')
const UnauthorizedError = require('../Errors/UnAuthorized-Error')
const BadRequestError = require('../Errors/Bad-Request-Error')
const router = express.Router()


router.delete('/delete/:id', currentUserMiddleware, async (req, res, next) => {
    try {
        if (req.currentUser) {
            const id = req.params.id
            const projects = await projectModel.find({})
            const ids = projects.map(project => project._id.toString());
            if (!ids.includes(id)) {
                throw new BadRequestError("Project not found")
            } else {
                const currentProject = await projectModel.findById(id)

                const deletedProject = await projectModel.deleteOne({ _id: id })
                if (currentProject.issues.length > 0) {
                    //xóa các issue thuộc project này
                    await issueModel.deleteMany({ _id: { $in: currentProject.issues } })
                    //publish sự kiện xóa các issues trong issue service
                    projectManagementPublisher(currentProject.issues, 'projectmanagement:deleted')
                }
                res.status(200).json({
                    message: "Suscessfully deleted this project",
                    data: deletedProject
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