const mongoose = require('mongoose')

const fileSchema = mongoose.Schema({
    fileName: {
        type: String
    },
    size: {
        type: Number
    },
    originalname: {
        type: String
    },
    mimetype: {
        type: String
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId
    }
})

const fileModel = mongoose.model('files', fileSchema)

module.exports = fileModel