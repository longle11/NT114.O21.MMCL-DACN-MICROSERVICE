const express = require("express")
const categoryModel = require('../models/category')
const router = express.Router()
router.get('/list', async (req, res) => {
    const listCategories = await categoryModel.find({})
    res.status(200).json({
        message: "Danh sach danh muc",
        data: listCategories
    })
})

module.exports = router