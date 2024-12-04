const mongoose = require('mongoose')

const componentSchema = mongoose.Schema({
    component_name: {
        type: String, 
        default: null
    }
})

const componentModel = mongoose.model('components', componentSchema)

module.exports = componentModel