const mongoose = require("mongoose")

const workflowSchema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    name_workflow: {
        type: String,
        default: null
    },
    issue_statuses: {
        type: Array,
        default: []
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: null
    },
    nodes: [
        {
            id: {
                type: String,
                default: null
            },
            data: {
                label: {
                    type: String,
                    default: null
                }
            },
            type: {
                type: String,
                default: null
            },
            position: {
                x: {
                    type: Number,
                    default: null
                },
                y: {
                    type: Number,
                    default: null
                },
            }
        }
    ],
    edges: [
        {
            id: {
                type: String,
                default: null
            },
            source: {
                type: String,
                default: null
            },
            target: {
                type: String,
                default: null
            },
            label: {
                type: String,
                default: null
            }
        }
    ]
})


const workflowModel = new mongoose.model('workflows', workflowSchema)

module.exports = workflowModel