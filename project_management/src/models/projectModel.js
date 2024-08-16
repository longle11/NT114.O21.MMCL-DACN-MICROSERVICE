const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema({
    name_project: {
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
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    ],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories'
    },
    sprint_id: mongoose.Schema.Types.ObjectId
})

const projectModel = mongoose.model('projects', projectSchema)

module.exports = projectModel