const express = require('express')
const router = express.Router()
const sprintModel = require('../models/sprintModel');
const servicePublisher = require('../nats/publisher/service-publisher');
router.put('/update/:sprintId', async (req, res, next) => {
    try {
        const getSprint = await sprintModel.findById(req.params.sprintId)
        if (req.body?.issue_list) {
            req.body.issue_list = getSprint.issue_list.concat(req.body.issue_list)
        }
        if (getSprint !== null) {
            if (req.body?.issue_id && typeof req.body?.inserted_index === 'number') {
                //find to see whether issue id is existed in sprint list or not 
                //if it existed, proceed delete it from the list, opposite insert that issue into the list
                const findIndex = getSprint.issue_list.findIndex(issue => issue._id.toString() === req.body.issue_id)
                if (findIndex === -1) {
                    getSprint.issue_list.splice(req.body?.inserted_index, 0, req.body.issue_id)
                    req.body.issue_list = getSprint.issue_list
                } else {
                    getSprint.issue_list.splice(parseInt(findIndex), 1)
                    req.body.issue_list = getSprint.issue_list
                }
                //thiet lap gia tri issue_id sang null de khong can chen vao danh sach
                req.body.issue_id = null
            }

            if (typeof req.body?.issue_source_index === "number" && typeof req.body?.issue_dest_index === "number") {
                [getSprint.issue_list[req.body?.issue_source_index], getSprint.issue_list[req.body?.issue_dest_index]] = [getSprint.issue_list[req.body?.issue_dest_index], getSprint.issue_list[req.body?.issue_source_index]]
                req.body.issue_list = [...getSprint.issue_list]
            }

            const data = await sprintModel.findByIdAndUpdate(req.params.sprintId, { $set: { ...req.body } })

            res.status(200).json({
                message: "Successfully updated a sprint",
                data: data
            })
        }

    } catch (error) {
        console.log(error);
    }
})

module.exports = router
