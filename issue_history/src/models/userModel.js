const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        default: null
    },
    avatar: {
        type: String,
        default: null
    }
})
const userModel = new mongoose.model('users', userSchema)

module.exports = userModel