const mongoose = require('mongoose')

const projectSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId, 
        default: null
    },
    name_project: {
        type: String, 
        default: null
    }
})

projectSchema.virtual('projectsRefProjectID', {
    ref: 'issues',
    foreignField: '_id',
    localField: 'project_id'
})

const projectModel = mongoose.model('projects', projectSchema)

module.exports = projectModel