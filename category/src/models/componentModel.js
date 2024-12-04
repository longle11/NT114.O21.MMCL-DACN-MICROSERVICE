const mongoose = require('mongoose')

const componentSchema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    component_name: {
        type: String, 
        default: null
    },
    description: {
        type: String,
        default: null
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    component_lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    issue_list: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'issues'
        }
    ]
})

const componentModel = mongoose.model('components', componentSchema)

module.exports = componentModel