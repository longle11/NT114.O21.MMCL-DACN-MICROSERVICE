const express = require("express")
const categoryModel = require("../models/category")

const router = express.Router()

router.get('/delete',async (req, res) => {
    const data = await categoryModel.deleteMany({})

    res.send(data)
})

module.exports = router