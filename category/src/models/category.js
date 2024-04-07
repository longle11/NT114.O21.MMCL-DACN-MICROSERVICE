const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        default: null
    }
})

const categoryModel = mongoose.model('categories', categorySchema)

module.exports = categoryModel