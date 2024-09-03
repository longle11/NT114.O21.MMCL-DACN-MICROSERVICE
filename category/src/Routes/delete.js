const express = require("express")
const categoryModel = require("../models/category")
const epicModel = require("../models/epicModel")
const BadRequestError = require("../errors/Bad-Request-Error")
const router = express.Router()

router.get('/delete', async (req, res) => {
    const data = await categoryModel.deleteMany({})

    res.send(data)
})

router.delete('/epic/:epicId', async (req, res, next) => {
    try {
        await epicModel.findByIdAndDelete(req.params.epicId).then((value) => {
            return res.status(200).json({
                message: "Successfully deleted an epic"
            })
        }).catch(err => {
            throw new BadRequestError('Failed to delete an epic')
        })
    } catch (error) {
        next(error)
    }
})

router.delete('/version/:versionId', async (req, res, next) => {
    try {
        await versionModel.findByIdAndDelete(req.params.versionId).then((value) => {
            return res.status(200).json({
                message: "Successfully deleted a version"
            })
        }).catch(err => {
            throw new BadRequestError('Failed to delete a version')
        })
    } catch (error) {
        next(error)
    }
})

module.exports = router