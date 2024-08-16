const mongoose = require("mongoose")

const sprintSchema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },  
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
    ],
    sprint_status: {
        type: String,
        default: 'pending'
    }
})

const sprintModel = mongoose.model('sprints', sprintSchema)
module.exports = sprintModel