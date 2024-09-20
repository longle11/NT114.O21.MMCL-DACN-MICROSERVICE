const express = require("express")
const notifyModel = require("../models/notifyModel")
const issuePublisher = require("../nats/publisher/issue-publisher")


const router = express.Router()

router.put("/update/:notificationId", async (req, res, next) => {
    try {
        const getNotification = await notifyModel.findById(req.params.notificationId)
        if (getNotification) {
            const notificationUpdated = await notifyModel.findByIdAndUpdate(req.params.notificationId, { ...req.body })

            if (typeof req.body?.action_type === "string") {
                issuePublisher({ user_id: getNotification.send_to, project_id: getNotification.project_id }, req.body.action_type)
            }

            return res.status(200).json({
                message: "Successfully updated this notification",
                data: notificationUpdated
            })
        }
        return res.status(200).json({
            message: "Failed to update this notification",
            data: getNotification
        })


    } catch (error) {
        console.log(error);
        next(error)
    }
})


module.exports = router;