const express = require('express')
const projectModel = require('../models/projectModel')
const BadRequestError = require('../Errors/Bad-Request-Error')
const router = express.Router()

router.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id
        let keyword = req.query.keyword
        const projects = await projectModel.find({})
        const ids = projects.map(project => project._id.toString());
        if (ids.includes(id)) {
            const currentProject = await projectModel
                .findById(id)
                .populate({
                    path: 'members',
                    select: '-__v'
                })
                .populate([
                    {
                        path: 'issues',
                        select: '-__v',
                        populate: {
                            path: 'assignees',
                            select: '-__v'
                        }
                    },
                    {
                        path: 'issues',
                        select: '-__v',
                        populate: {
                            path: 'creator',
                            select: '-__v'
                        }
                    }
                ])
            const filteredIssues = currentProject.issues.filter(issue => {
                const regex = new RegExp(keyword, 'i');
                return regex.test(issue.shortSummary);
            });

            currentProject.issues = filteredIssues
            res.status(200).json({
                message: "Lay thanh cong project",
                data: currentProject
            })
        }else {
            throw new BadRequestError("Project not found")
        }

    } catch (error) {
        next(error)
    }
})

module.exports = router