const mongoose = require("mongoose")

const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    password: {
        type: String,
        default: null
    },
    avatar: {
        type: String,
        default: null
    },
})

const userModel = new mongoose.model('users', userSchema)

userSchema.pre("save", function(next) {
    if(this.isModified("password")) {
        //tien hanh ma hoa 
        const salt = bcrypt.genSaltSync(10)
        this.password = bcrypt.hashSync(this.password, salt)

        next()
    }

    next()
})

module.exports = userModel