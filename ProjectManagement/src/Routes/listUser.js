const express = require('express')
const userModel = require('../models/userModel')

const router = express.Router()

router.get('/listuser', async (req, res) => {
    try {
        let keyword = req.query.keyword
        if (keyword !== null) {
            keyword = { username: { $regex: keyword, $options: 'i' } }
        } else {
            keyword = {}
        }
        const listUser = await userModel.find(keyword)
    
        res.status(200).json({
            message: "Lay thanh cong danh sach",
            data: listUser
        })
    }catch(error) {

    }
})

module.exports = router