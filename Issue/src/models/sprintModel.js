const mongoose = require('mongoose')

const sprintSchema = mongoose.Schema({
    sprint_name: {
        type: String, 
        default: null
    },
    sprint_status: {
        type: String,
        default: 'pending'
    }
})

sprintSchema.virtual('issueRefCurrentSprint', {
    ref: 'issues',
    foreignField: '_id',
    localField: 'current_sprint'
})

sprintSchema.virtual('issueRefOldSprint', {
    ref: 'issues',
    foreignField: '_id',
    localField: 'old_sprint'
})

const sprintModel = mongoose.model('sprints', sprintSchema)

module.exports = sprintModel