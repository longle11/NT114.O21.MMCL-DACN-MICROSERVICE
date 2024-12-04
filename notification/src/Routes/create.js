const express = require("express")
const notifyModel = require("../models/notifyModel")


const router = express.Router()

router.post("/create", async (req, res, next) => {
    try {
        const data = new notifyModel({ ...req.body, createAt: new Date() })
        await data.save()
        res.status(201).json({
            message: "Successfully created a new notification",
            data: data
        })

    } catch (error) {
        console.log(error);
        next(error)
    }
})


module.exports = router;