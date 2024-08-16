const express = require('express')
const userModel = require('../models/users')
const router = express.Router()

router.post('/update/:id', async (req, res, next) => {
    const currentUser = await userModel.findById(req.params.id)
    console.log("hehe ",req.body);
    currentUser.project_working = req.body.project_working
    currentUser.save()
    const getNewInfo = {
        id: currentUser._id,    
        username: currentUser.username,
        email: currentUser.email,
        avatar: currentUser.avatar,
        project_working: currentUser.project_working
    }
    res.status(200).json({
        message: "Successfully updated user information",
        data: getNewInfo
    })
})

module.exports = router