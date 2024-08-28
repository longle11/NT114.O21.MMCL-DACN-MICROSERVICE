const express = require('express')
const projectModel = require('../models/projectModel')
const currentUserMiddleware = require('../Middlewares/currentUser-Middleware')
const BadRequestError = require('../Errors/Bad-Request-Error')
const UnauthorizedError = require('../Errors/UnAuthorized-Error')
const { default: mongoose } = require('mongoose')
const router = express.Router()


router.put('/update/:id', currentUserMiddleware, async (req, res, next) => {
    try {
        if (req.currentUser) {
            const id = req.params.id
            const projects = await projectModel.find({})
            const ids = projects.map(project => project._id.toString());
            if (!ids.includes(id)) {
                throw new BadRequestError("Project not found")
            } else {
                if (req.body?.user_info && typeof req.body?.user_role === "number") {

                    const getProject = await projectModel.findById(req.params.id)
                    if (getProject) {

                        const memberInProject = getProject.members.map(user => user.user_info.toString())
                        if (memberInProject.includes(req.body.user_info)) {
                            throw new BadRequestError('User is already existed in this project')
                        } else {
                            const id = new mongoose.Types.ObjectId(req.body?.user_info);
                            getProject.members.push({
                                user_info: id,
                                user_role: req.body?.user_role
                            })
                            req.body.members = [...getProject.members]
                            req.body.user_info = null
                            req.body.user_role = null

                        }
                    }
                }

                //if in body only has user_info that means deleting the user from the project
                if (req.body?.user_info) {
                    const getProject = await projectModel.findById(id)
                    if (getProject) {
                        const index = getProject.members.findIndex(user => user.user_info.toString() === req.body.user_info)
                        if (index !== -1) {
                            getProject.members.splice(index, 1)
                            req.body.members = [...getProject.members]
                        }
                    }
                    req.body.user_info = null
                }

                //update show or hidden cols in table
                if (req.body?.table_col_key) {
                    const getProject = await projectModel.findById(req.params.id)
                    if (getProject) {
                        const findIndex = getProject.table_issues_list.findIndex(col => col.key === req.body.table_col_key)
                        if (findIndex !== -1) {
                            getProject.table_issues_list[findIndex].isShowed = req.body.isShowed
                            req.body.table_issues_list = [...getProject.table_issues_list]
                        }
                    }
                    req.body.table_col_key = null
                    req.body.isShowed = null
                }

                //proceed permutation the position of 2 cols
                if (Number.isInteger(req.body?.table_col_key_from) && Number.isInteger(req.body?.table_col_key_to)) {
                    const getProject = await projectModel.findById(req.params.id)
                    if (getProject) {
                        const find_index_col_from = getProject.table_issues_list.findIndex(col => col.til_index === req.body?.table_col_key_from)
                        const find_index_col_to = getProject.table_issues_list.findIndex(col => col.til_index === req.body?.table_col_key_to)
                        if (find_index_col_from !== -1 && find_index_col_to !== -1) {
                            console.log("vao day de swap ne From ",getProject.table_issues_list[find_index_col_from] );
                            console.log("vao day de swap ne From ",getProject.table_issues_list[find_index_col_to] );
                            
                            getProject.table_issues_list[find_index_col_from].til_index = req.body?.table_col_key_to
                            getProject.table_issues_list[find_index_col_to].til_index = req.body?.table_col_key_from
                        }

                        req.body.table_issues_list = [...getProject.table_issues_list]
                    }

                    req.body.table_col_key_from = null
                    req.body.table_col_key_to = null
                }

                const updatedProject = await projectModel.updateOne(
                    { "_id": id },
                    { $set: { ...req.body } }
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
        console.log("loi xay ra ", error);

        next(error)
    }
})

module.exports = router