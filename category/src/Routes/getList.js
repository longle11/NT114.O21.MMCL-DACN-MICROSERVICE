const express = require("express")
const categoryModel = require('../models/category')
const epicModel = require("../models/epicModel")
const versionModel = require("../models/versionModel")
const BadRequestError = require("../errors/Bad-Request-Error")
const router = express.Router()
router.get('/list', async (req, res) => {
    const listCategories = await categoryModel.find({})
    res.status(200).json({
        message: "Danh sach danh muc",
        data: listCategories
    })
})

router.get('/epic-list/:projectId', async (req, res, next) => {
    try {
        const getEpics = await epicModel.find({ project_id: req.params.projectId })
            .populate({
                path: 'creator'
            })
            .populate({
                path: 'issue_list'
            })
        console.log("gia tri lay ra duoc getEpics ", );
        
        if (getEpics.length > 0) {
            return res.status(200).json({
                message: "Successfully get epic list",
                data: getEpics
            })
        }
        throw new BadRequestError('Error')
    } catch (error) {
        console.log("error /epic-list/:projectId", error);
        
        next(error)
    }
})

router.get('/version-list/:projectId', async (req, res, next) => {
    try {
        const getVersions = await versionModel.find({ project_id: req.params.projectId })
            .populate({
                path: 'creator'
            })
            .populate({
                path: 'issue_list'
            })
        if (getVersions) {
            return res.status(200).json({
                message: "Successfully get version list",
                data: getVersions
            })
        }

        throw new BadRequestError("Failed to get version list")
    } catch (error) {
        console.log("error /version-list/:projectId", error);
        next(error)
    }
})

router.get('/epic/:epicId', async (req, res, next) => {
    try {
        const getEpics = await epicModel.findById(req.params.epicId)
            .populate({
                path: 'creator'
            })
            .populate({
                path: 'issue_list'
            })
        if (getEpics) {
            return res.status(200).json({
                message: "Successfully get epic by id",
                data: getEpics
            })
        }
        throw new BadRequestError('error')
    } catch (error) {
        next(error)
    }
})
router.get('/version/:versionId', async (req, res, next) => {
    try {
        const getVersion = await versionModel.findById(req.params.versionId)
            .populate({
                path: 'creator'
            })
            .populate({
                path: 'issue_list'
            })

        if (getVersion) {
            return res.status(200).json({
                message: "Successfully get version by id",
                data: getVersion
            })
        }
        throw new BadRequestError('error')
    } catch (error) {
        next(error)
    }
})

module.exports = router