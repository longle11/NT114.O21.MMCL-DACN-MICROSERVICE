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
                    populate: {
                        path: 'user_info'
                    },
                    select: '-__v'
                })
                .populate({
                    path: 'creator',
                    select: '-__v'
                })
            // .populate([
            //     {
            //         path: 'issues',
            //         select: '-__v',
            //         populate: {
            //             path: 'assignees',
            //             select: '-__v'
            //         }
            //     },
            //     {
            //         path: 'issues',
            //         select: '-__v',
            //         populate: {
            //             path: 'creator',
            //             select: '-__v'
            //         }
            //     }
            // ])
            // const filteredIssues = currentProject.issues.filter(issue => {
            //     const regex = new RegExp(keyword, 'i');
            //     return regex.test(issue.shortSummary);
            // });


            // currentProject.issues = filteredIssues
            return res.status(200).json({
                message: "Successfully got the project",
                data: currentProject
            })
        } else {
            throw new BadRequestError("Project not found")
        }

    } catch (error) {
        next(error)
    }
})

router.get('/get-project/name', async (req, res) => {
    try {
        console.log("data ", " voi req.query.name_project", req.query.name_project);

        const data = await projectModel.find({ name_project: req.query.name_project })
        
        if(data.length > 0) {
            return res.status(200).json({
                message: "Successfully got the project",
                data: data[0]
            })
        }

        throw new BadRequestError('Project not found')
    } catch (error) {
        console.log("error ", error);
        
    }
})

module.exports = router