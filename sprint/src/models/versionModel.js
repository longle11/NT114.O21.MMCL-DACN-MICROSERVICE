const mongoose = require("mongoose")

const versionSchema = new mongoose.Schema({
    version_name: {
        type: String, 
        default: null
    },
    tag_color: {
        type: String,
        default: null
    }
})

versionSchema.virtual('issuesRefFixVersion', {
    ref: 'issues',
    foreignField: '_id',
    localField: 'fix_version'
})

const versionModel = mongoose.model('versions', versionSchema)
module.exports = versionModel