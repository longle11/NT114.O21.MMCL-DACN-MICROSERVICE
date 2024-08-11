const mongoose = require("mongoose")

const sprintSchema = new mongoose.Schema({
    sprint_name: {
        type: String, 
        default: null
    },
    start_date: {
        type: Date,
        default: null
    },
    end_date: {
        type: Date,
        default: null
    },
    sprint_goal: {
        type: String,
        default: null
    },
    createAt: {
        type: Date,
        default: null
    },
    issue_list: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'issues' 
        }
    ]
})

const sprintModel = mongoose.model('sprints', sprintSchema)
module.exports = sprintModel