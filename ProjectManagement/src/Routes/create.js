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
            const existedProject = await projectModel.findOne({ nameProject })
            //neu project chua ton tai
            if (existedProject) {
                throw new BadRequestError("Project already existed")
            } else {
                let members = []
                members.push(creator)
                const project = await projectModel.create({
                    nameProject,
                    description,
                    category,
                    creator,
                    members
                })
                res.status(201).json({
                    message: "Initial success project",
                    data: project
                })
            }

            res.status(200).json({
                message: "Something went wrong",
            })
        } else {
            throw new UnauthorizedError("Authentication failed")
        }
    } catch (error) {
        next(error)
    }
})

module.exports = router