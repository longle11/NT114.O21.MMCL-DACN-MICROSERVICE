const express = require('express')
const currentUserMiddleware = require('../Middlewares/currentUser-Middleware')
const projectModel = require('../models/projectModel')
const BadRequestError = require('../Errors/Bad-Request-Error')
const UnauthorizedError = require('../Errors/UnAuthorized-Error')

const router = express.Router()

router.post('/create', currentUserMiddleware, async (req, res, next) => {
    try {
        if (req.currentUser) {
            const { nameProject, description, category, creator } = req.body;
            const projects = await projectModel.find({})
            const listNames = projects.map(project => project.nameProject);
            //neu project chua ton tai
            if (listNames.includes(nameProject)) {
                throw new BadRequestError("Project already existed")
            } else {
                let members = []
                members.push(creator)
                const newProject = await new projectModel({
                    nameProject,
                    description,
                    category,
                    creator,
                    members
                }).save()
                res.status(201).json({
                    message: "Initial success project",
                    data: newProject
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