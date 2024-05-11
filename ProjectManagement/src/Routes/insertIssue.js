const express = require('express')
const projectModel = require('../models/projectModel')
const currentUserMiddleware = require('../Middlewares/currentUser-Middleware')
const BadRequestError = require('../Errors/Bad-Request-Error')
const UnauthorizedError = require('../Errors/UnAuthorized-Error')
const router = express.Router()

router.put('/insert/issue', currentUserMiddleware, async (req, res, next) => {
    try {
        if (req.currentUser) {
            const { project_id, issue_id } = req.body

            const currentProject = await projectModel.findById(project_id)

            if (currentProject) {
                let listIssue = currentProject.issues

                listIssue.push(issue_id)
                const filter = { "_id": project_id };
                const update = { $set: { issues: listIssue } };
                await projectModel.findByIdAndUpdate(filter, update, { new: true })
                return res.status(200).json({
                    message: "Successfully added issue in this project",
                    data: currentProject
                })
            } else {
                throw new BadRequestError("Project not found")
            }
        } else {
            throw new UnauthorizedError("Authentication failed")
        }
    } catch (error) {
        next(error)
    }
})

module.exports = router