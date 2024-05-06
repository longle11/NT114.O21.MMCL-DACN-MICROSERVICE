const commentModel = require('../../models/commentModel')
const issueModel = require('../../models/issueModel')
const natsWrapper = require('../../nats-wrapper')
const issuePublisher = require('../publisher/issue-publisher')

const projectManagementUpdatedListener = () => {
    const options = natsWrapper.client.subscriptionOptions()
        .setManualAckMode(true)

    const subscription = natsWrapper.client.subscribe('projectManagement:updated', options)

    subscription.on('message', async (msg) => {
        if (typeof msg.getData() === 'string') {
            console.log(`Received event projectManagement:updated with sequence number: ${msg.getSequence()}`);

            const parseData = JSON.parse(msg.getData())

            let currentIssue = await issueModel.findById(parseData.issue._id)

            if (currentIssue) {
                //kiểm tra xem issue này có phải do người dùng đó tạo ra hay không
                if (currentIssue.creator.toString() === parseData.userId) {
                    const listComments = currentIssue.comments

                    await issueModel.deleteOne({ _id: currentIssue._id })

                    //xóa danh sách comment trong chính issue đó
                    if (listComments.length > 0) {
                        //tiến hành xóa các commnet đó trong comment model
                        await commentModel.deleteMany({ _id: { $in: listComments } })

                        await issuePublisher(listComments, 'issue-comment:deleted')
                    }
                } else { //ngược lại user này chỉ nằm trong các dự án issue
                    //tìm user đó trong nhóm assignee
                    const index = currentIssue.assignees.findIndex(id => id.toString() === parseData.userId.toString())

                    if (index !== -1) {
                        currentIssue.assignees.splice(index, 1)
                        await issueModel.updateOne({ _id: currentIssue._id }, { assignees: currentIssue.assignees })


                        //lấy ra danh sách comment id
                        const listCommentIds = currentIssue.comments

                        //lấy ra danh sách các comment hiện có
                        let listComments = await commentModel.find({ _id: { $in: listCommentIds } })

                        const userComments = listComments.filter(comment => {
                            if (comment.creator.toString() === parseData.userId.toString()) {
                                return true
                            }
                            return false
                        }).map(comment => comment._id)

                        if (userComments.length > 0) {
                            //tiến hành xóa các comment id trong issue
                            const userCommentsBelongToIssue = listCommentIds.filter(id => !userComments.includes(id))
                            //xóa các comment trong comment model
                            
                            const deleteComments = await commentModel.deleteMany({_id: {$in: userComments}})
                            await issueModel.updateOne({ _id: currentIssue._id }, { comments: userCommentsBelongToIssue })
                            await issuePublisher(userComments, 'issue-comment:deleted')
                        }
                    }
                }
            }

            msg.ack()
        }
    })
}

module.exports = projectManagementUpdatedListener