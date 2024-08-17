const express = require("express")
const epicModel = require("../models/epicModel")
const router = express.Router()
router.put('/update/:epicId', async (req, res) => {
    const getEpic = await epicModel.findById(req.params.epicId)
    if(getEpic) {
        if(req.body.issue_id !== null) {
            if(getEpic.issue_list.length === 0) {
                getEpic.issue_list.push(req.body.issues_id)
            }else {
                const getEpicIndex = getEpic.issue_list.findIndex(issue => issue._id.toString() === req.body.issue_id)
                if(!getEpicIndex) {  //neu da ton tai roi
                    getEpic.issue_list.push(req.body.issues_id)
                }
            }
            req.body.issue_list === getEpic.issue_list
            req.body.issue_id = null
        }
        if(req.body.epic_id !== null) {
            const deleteIssueEpic = await epicModel.findById(req.body.epic_id)
            if(deleteIssueEpic) {
                const index = deleteIssueEpic.issue_list.findById(issue => issue._id.toString() === req.body.epic_id)
                if(index) {
                    console.log("deleteIssueEpic luc dau ", deleteIssueEpic.issue_list);
                    
                    deleteIssueEpic.issue_list.splice(index, 1)
                    console.log("xoa thanh cong issue trong epic cu ", deleteIssueEpic.issue_list);
                    
                    await epicModel.findByIdAndUpdate(req.body.epic_id, {$set: {issue_list: deleteIssueEpic.issue_list}})
                }
            }
        }
        await epicModel.findByIdAndUpdate(req.params.epicId, {$set: {...req.body}})

        return res.status(200).json({
            message: "Successfully updated an epic",
            data: getEpic
        })
    }
})


module.exports = router