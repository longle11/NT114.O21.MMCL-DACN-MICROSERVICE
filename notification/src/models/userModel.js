const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        default: null
    },
    avatar: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    }
})

userSchema.virtual('notifyRefSendFrom', {
    ref: 'notify',
    foreignField: '_id',
    localField: 'send_from'
})


const userModel = new mongoose.model('users', userSchema)

module.exports = userModel