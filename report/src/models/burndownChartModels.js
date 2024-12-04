const mongoose = require('mongoose')

const burndownSchema = new mongoose.Schema({
    chart_name: String,
    project_id: mongoose.Schema.Types.ObjectId,
    sprint_id: mongoose.Schema.Types.ObjectId,
    start_date: String,
    end_date: String,
    total_issue: Number,
    total_story_point: Number,
    current_story_point_remaining: Number,
    story_point_data: [
        {
            current_time: Date,
            issue_ordinal_number: mongoose.Schema.Types.Mixed,
            issue_id: mongoose.Schema.Types.ObjectId,
            event_type: String,
            event_detail: String,
            current_story_point: Number,
            increase: Number,
            decrease: Number,
            remaining: Number
        }
    ]
})

const burndownModel = mongoose.model('burndownReport', burndownSchema)

module.exports = burndownModel