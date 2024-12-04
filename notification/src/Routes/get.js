const express = require("express")
const notifyModel = require("../models/notifyModel")


const router = express.Router()

router.get("/notification-list/:userId", async (req, res, next) => {
    try {
        const data = await  notifyModel.find({ send_to: req.params.userId })
            .populate({
                path: 'send_from'
            })
        res.status(200).json({
            message: "Successfully got notification list",
            data: data
        })

    } catch (error) {
        console.log(error);
        next(error)
    }
})  


module.exports = router;