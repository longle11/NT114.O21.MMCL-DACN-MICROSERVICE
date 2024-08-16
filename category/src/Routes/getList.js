const express = require("express")
const categoryModel = require('../models/category')
const epicModel = require("../models/epicModel")
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
    res.status(200).json({
        message: "Successfully get epic list",
        data: getEpics
    })
})

module.exports = router