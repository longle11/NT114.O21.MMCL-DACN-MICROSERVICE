const express = require("express")
const categoryModel = require('../models/category')
const epicModel = require("../models/epicModel")
const versionModel = require("../models/versionModel")
const router = express.Router()
router.get('/list', async (req, res) => {
    const listCategories = await categoryModel.find({})
    res.status(200).json({
        message: "Danh sach danh muc",
        data: listCategories
    })
})

router.get('/epic-list/:projectId', async (req, res) => {
    const getEpics = await epicModel.find({project_id: req.params.projectId})
        .populate({
            path: 'creator'
        })
        .populate({
            path: 'issue_list'
        })
    
    res.status(200).json({
        message: "Successfully get epic list",
        data: getEpics
    })
})

router.get('/version-list/:projectId', async (req, res) => {
    const getVersions = await versionModel.find({project_id: req.params.projectId})
        .populate({
            path: 'creator'
        })
        .populate({
            path: 'issue_list'
        })
    if(getVersions) {
        return res.status(200).json({
            message: "Successfully get version list",
            data: getVersions
        })
    }

    return res.status(400).json({
        message: "Failed to get version list",
    })
})

router.get('/epic/:epicId', async (req, res) => {
    const getEpics = await epicModel.findById(req.params.epicId)
        .populate({
            path: 'creator'
        })
        .populate({
            path: 'issue_list'
        })
    res.status(200).json({
        message: "Successfully get epic by id",
        data: getEpics
    })
})
router.get('/version/:versionId', async (req, res) => {
    const getVersion = await versionModel.findById(req.params.versionId)
        .populate({
            path: 'creator'
        })
        .populate({
            path: 'issue_list'
        })
    
    res.status(200).json({
        message: "Successfully get version by id",
        data: getVersion
    })
})

module.exports = router