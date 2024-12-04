const mongoose = require("mongoose")

const epicSchema = new mongoose.Schema({
    epic_name: {
        type: String, 
        default: null
    },
    tag_color: {
        type: String,
        default: null
    }
})

epicSchema.virtual('issuesRefEpicLink', {
    ref: 'issues',
    foreignField: '_id',
    localField: 'epic_link'
})

const epicModel = mongoose.model('epics', epicSchema)
module.exports = epicModel