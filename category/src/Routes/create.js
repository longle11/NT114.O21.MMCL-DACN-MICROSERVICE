const express = require("express")
const categoryModel = require('../models/category')
const categoryPublisher = require('../nats/category-publisher')
const router = express.Router()

const objects = [
    "Kinh te chinh tri",
    "Thuong mai dien tu",
    "Cong nghe thong tin",
    "Buu chinh vien thong",
    "Cong nghe thuc pham",
    "Mang may tinh va truyen thong",
    "An toan thong tin",
    "Khoa hoc may tinh",
    "Khoa hoc du lieu"
]

router.get('/create', async (req, res) => {
    for (const obj of objects) {
        await categoryModel.create({
            name: obj
        })
    }
    const listData = await categoryModel.find({})

    console.log(listData);

    categoryPublisher(listData, 'category:created')
    res.status(201).json({
        message: "Khoi tao thanh cong",
        data: listData
    })
})

module.exports = router