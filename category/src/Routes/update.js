const express = require("express")
const epicModel = require("../models/epicModel")
const versionModel = require("../models/versionModel")
const componentModel = require("../models/componentModel")
const servicePublisher = require("../nats/publisher/service-publisher")
const router = express.Router()
router.put('/epic-update/:epicId', async (req, res) => {
    const getEpic = await epicModel.findById(req.params.epicId)
    if (getEpic) {
        if (req.body.issue_id) {
            if (getEpic.issue_list.length === 0) {
                getEpic.issue_list.push(req.body.issue_id)
            } else {
                const getEpicIndex = getEpic.issue_list.findIndex(issue => issue?._id.toString() === req.body.issue_id)
                if (getEpicIndex === -1) {  //neu chua ton tai
                    getEpic.issue_list.push(req.body.issue_id)
                }
            }
            req.body.issue_list = getEpic.issue_list
        }

        if (req.body.epic_id) {
            const deleteIssueEpic = await epicModel.findById(req.body.epic_id)
            if (deleteIssueEpic) {
                const index = deleteIssueEpic.issue_list.findIndex(issue => issue._id.toString() === req.body.issue_id)
                if (index !== -1) {
                    deleteIssueEpic.issue_list.splice(index, 1)
                    await epicModel.findByIdAndUpdate(req.body.epic_id, { $set: { issue_list: deleteIssueEpic.issue_list } })
                }
            }
        }

        req.body.issue_id = null
        req.body.epic_id = null

        await epicModel.findByIdAndUpdate(req.params.epicId, { $set: { ...req.body } })

        servicePublisher({ ...req.body, epic_id: req.params.epicId }, 'epic:updated')

        return res.status(200).json({
            message: "Successfully updated an epic",
            data: getEpic
        })
    }
})

router.put('/version-update/:versionId', async (req, res) => {
    const getVersion = await versionModel.findById(req.params.versionId)

    if (getVersion) {

        if (req.body?.issue_list) {
            const getVersion = await versionModel.findById(req.params.versionId)
            if (getVersion) {
                req.body.issue_list = getVersion.issue_list.concat(req.body.issue_list)
            }
        }

        if (req.body.issue_id) {
            if (getVersion.issue_list.length === 0) {
                getVersion.issue_list.push(req.body.issue_id)
            } else {
                const getVersionIndex = getVersion.issue_list.findIndex(issue => issue?._id.toString() === req.body.issue_id)
                if (getVersionIndex === -1) {  //neu chua ton tai
                    getVersion.issue_list.push(req.body.issue_id)
                } else {
                    getVersion.issue_list.splice(index, 1)
                }
            }
            req.body.issue_list = getVersion.issue_list
        }

        if (req.body?.remove_issue_list) {
            const getVersion = await versionModel.findById(req.params.versionId)
            req.body.issue_list = getVersion.issue_list.filter(issue => !req.body.remove_issue_list.includes(issue.toString()))
            req.body.remove_issue_list = null
        }


        req.body.issue_id = null
        req.body.version_id = null

        await versionModel.findByIdAndUpdate(req.params.versionId, { $set: { ...req.body } })
        servicePublisher({ ...req.body, version_id: req.params.versionId  }, 'version:updated')
        return res.status(200).json({
            message: "Successfully updated an epic",
            data: getVersion
        })
    }
})

router.put('/component-update/:componentId', async (req, res) => {
    try {
        const getComponent = await componentModel.findById(req.params.componentId)

        if (getComponent) {
            if (req.body?.issue_list) {
                if (getComponent) {
                    req.body.issue_list = getComponent.issue_list.concat(req.body.issue_list)
                }
            }

            if (req.body.issue_id) {
                if (getComponent.issue_list.length === 0) {
                    getComponent.issue_list.push(req.body.issue_id)
                } else {
                    const getComponentIndex = getComponent.issue_list.findIndex(issue => issue?._id.toString() === req.body.issue_id)
                    if (getComponentIndex === -1) {  //neu chua ton tai
                        getComponent.issue_list.push(req.body.issue_id)
                    } else {
                        getComponent.issue_list.splice(index, 1)
                    }
                }
                req.body.issue_list = getComponent.issue_list
            }

            if (req.body?.remove_issue_list) {
                req.body.issue_list = getComponent.issue_list.filter(issue => !req.body.remove_issue_list.includes(issue.toString()))
                req.body.remove_issue_list = null
            }


            delete req.body['issue_id']

            const data = await componentModel.findByIdAndUpdate(req.params.componentId, { $set: { ...req.body } })

            return res.status(200).json({
                message: "Successfully updated an version",
                data: getComponent
            })
        }
    } catch (error) {
        console.log("error ", error);

    }
})


module.exports = router