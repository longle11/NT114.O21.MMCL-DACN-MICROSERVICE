const express = require("express")
const categoryModel = require('../models/category')
const servicePublisher = require("../nats/publisher/service-publisher")
const router = express.Router()

const objects = [
    "Kinh tế chính trị",
    "Thương mại điện tử",
    "Công nghệ thông tin",
    "Bưu chính viễn thông",
    "Công nghệ thực phẩm",
    "Mạng tính và truyền thông",
    "An toàn thông tin",
    "Khoa học máy tính",
    "Khoa học dữ liệu"
]

router.get('/create', async (req, res) => {
    const categories = await categoryModel.find({})
    let listData = null
    if (categories.length === 0) {
        for (const obj of objects) {
            await categoryModel.create({
                name: obj
            })
        }
        listData = await categoryModel.find({})
        servicePublisher(listData, 'category:created')
    } else {
        listData = await categoryModel.find({})
    }

    res.status(201).json({
        message: "Success Initial",
        data: listData
    })
})

module.exports = router