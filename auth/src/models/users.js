const mongoose = require("mongoose")
const crypto = require('crypto')
const bcrypt = require("bcrypt")
const config = require("../Config/config")

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
    createAt: {
        type: Date,
        default: Date.now
    },
    isNewUser: {
        type: Boolean,
        default: true
    },
    token: {
        type: String,
        default: null
    },
    tokenExp: {
        type: Date, 
        default: Date.now()
    },
    status: {
        type: String,
        default: "pending"
    }
})


userSchema.pre("save", function(next) {
    // if(this.isModified("password")) {
    //     //tien hanh ma hoa 
    //     const salt = bcrypt.genSaltSync(10)
    //     this.password = bcrypt.hashSync(this.password, salt)

    //     next()
    // }
    next()
})

userSchema.methods.generateToken = function() {
    //create randomly a string has length equal 4
    const getToken = crypto.randomBytes(config.lengthByteRandom).toString('hex')
    //Can not save original string but has to encrypt that token
    this.token = crypto
        .createHash('sha256')
        .update(getToken)
        .digest('hex')
    //Time verification is 3 minutes
    this.tokenExp = Date.now() + config.timeTokenExp * 60 * 1000

    return getToken
}
const userModel = new mongoose.model('users', userSchema)


module.exports = userModel