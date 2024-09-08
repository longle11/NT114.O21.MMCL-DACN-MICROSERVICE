const express = require('express')
const currentUserMiddleware = require('../Middlewares/currentUser-Middleware')
const projectModel = require('../models/projectModel')
const BadRequestError = require('../Errors/Bad-Request-Error')
const UnauthorizedError = require('../Errors/UnAuthorized-Error')
const servicePublisher = require('../nats/publisher/projectmanagement-publisher')

const router = express.Router()

router.post('/create', currentUserMiddleware, async (req, res, next) => {
    try {
        if (req.currentUser) {
            const projects = await projectModel.find({})
            const listNames = projects.map(project => project.name_project);
            //neu project chua ton tai
            if (listNames.includes(req.body.name_project)) {
                throw new BadRequestError("Project already existed")
            } else {
                const newProject = await new projectModel(req.body).save()
                servicePublisher({ _id: newProject._id, name_project: newProject.name_project }, "projectmanagement:created")

                res.status(201).json({
                    message: "Initial success project",
                    data: newProject
                })
            }
        } else {
            throw new UnauthorizedError("Authentication failed")
        }
    } catch (error) {
        console.log(error);

        next(error)
    }
})
module.exports = router