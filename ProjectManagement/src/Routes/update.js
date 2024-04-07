const express = require('express')
const projectModel = require('../models/projectModel')
const currentUserMiddleware = require('../Middlewares/currentUser-Middleware')
const BadRequestError = require('../Errors/Bad-Request-Error')
const UnauthorizedError = require('../Errors/UnAuthorized-Error')
const router = express.Router()


router.put('/update/:id', currentUserMiddleware, async (req, res, next) => {
    try {
        if (req.currentUser) {
            const { category, description, nameProject } = req.body.props
            const id = req.params.id
            const currentProject = await projectModel.findById(id)

            if (!currentProject) {
                throw new BadRequestError("Project not found")
            } else {
                const updatedProject = await projectModel.updateOne(
                    { "_id": id },
                    { $set: { "category": category, "description": description, "nameProject": nameProject } }
                )

                res.status(200).json({
                    message: "Successfully updated project",
                    data: updatedProject
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