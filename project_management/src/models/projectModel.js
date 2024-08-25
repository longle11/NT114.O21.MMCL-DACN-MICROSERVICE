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
            user_info: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            },
            user_role: Number
        }
    ],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories'
    },
    marked: {
        type: Boolean,
        default: false
    }
})

const projectModel = mongoose.model('projects', projectSchema)

module.exports = projectModel