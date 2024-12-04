const { default: mongoose } = require("mongoose")
const issueModel = require("../../../models/issueModel")
const commentModel = require("../../../models/commentModel")
const userModel = require("../../../models/userModel")
const issuePublisher = require("../../publisher/issue-publisher")

const createCommentData = async (content, creator) => {
    return await commentModel.create({
        creator: creator,
        content: content
    })
}

const userData = async (username) => {
    return await userModel.create({
        username: username
    })
}
let testIssue1, testIssue2 = null
const setUp = async () => {

    //this user is the user who created issues
    const user1 = await userData("testuser1")
    const user2 = await userData("testuser2")
    const user3 = await userData("testuser3")

    const commentData1 = await createCommentData("comment 1", user1._id)
    const commentData2 = await createCommentData("comment 2", user1._id)
    const commentData3 = await createCommentData("comment 3", user3._id)
    const commentData4 = await createCommentData("comment 4", user2._id)
    const commentData5 = await createCommentData("comment 5", user2._id)
    const commentData6 = await createCommentData("comment 6", user2._id)



    testIssue1 = await issueModel.create({
        projectId: new mongoose.Types.ObjectId().toHexString(),
        creator: user2._id,
        priority: 0,
        timeSpent: 1,
        timeRemaining: 1,
        timeOriginalEstimate: 1,
        shortSummary: "Day la noi dung tom tat van de 1",
        issueType: 0,
        comments: [commentData1._id, commentData5._id]
    })

    testIssue2 = await issueModel.create({
        projectId: new mongoose.Types.ObjectId().toHexString(),
        creator: user1._id,
        priority: 3,
        timeSpent: 2,
        timeRemaining: 1,
        timeOriginalEstimate: 5,
        shortSummary: "Day la noi dung tom tat van de 2",
        issueType: 0,
        comments: [commentData2._id, commentData3._id, commentData4._id, commentData6._id],
        assignees: [user2._id, user3._id]
    })

    const listener = async (data, msg) => {
        let currentIssue = await issueModel.findById(data.issue._id)

        //kiểm tra xem issue này có phải do người dùng đó tạo ra hay không
        if (currentIssue) {
            if (currentIssue.creator.toString() === data.userId) {
                const listComments = currentIssue.comments

                await issueModel.deleteOne({ _id: currentIssue._id })

                //xóa danh sách comment trong chính issue đó
                if (listComments.length > 0) {
                    //tiến hành xóa các comment đó trong comment model
                    const deleteComments = await commentModel.deleteMany({ _id: { $in: listComments } })

                    await issuePublisher(listComments, 'issue-comment:deleted')
                    console.log("case 1", deleteComments);
                }
            } else { //ngược lại user này chỉ nằm trong các dự án issue
                //tìm user đó trong nhóm assignee
                const index = currentIssue.assignees.findIndex(id => id.toString() === data.userId.toString())

                if (index !== -1) {
                    currentIssue.assignees.splice(index, 1)
                    await issueModel.updateOne({ _id: currentIssue._id }, { assignees: currentIssue.assignees })


                    //lấy ra danh sách comment id
                    const listCommentIds = currentIssue.comments

                    //lấy ra danh sách các comment hiện có
                    let listComments = await commentModel.find({ _id: { $in: listCommentIds } })

                    const userComments = listComments.filter(comment => {
                        if (comment.creator.toString() === data.userId.toString()) {
                            return true
                        }
                        return false
                    }).map(comment => comment._id)

                    if (userComments.length > 0) {
                        //tiến hành xóa các comment id trong issue
                        const userCommentsBelongToIssue = listCommentIds.filter(id => !userComments.includes(id))
                        //xóa các comment trong comment model

                        const deleteComments = await commentModel.deleteMany({ _id: { $in: userComments } })
                        console.log("case 2", deleteComments);
                        await issueModel.updateOne({ _id: currentIssue._id }, { comments: userCommentsBelongToIssue })
                        await issuePublisher(userComments, 'issue-comment:deleted')
                    }
                }
            }
        }

        msg.ack()
    }

    const fakeDataCase1 = { issue: testIssue2, userId: user1._id.toString() }
    const fakeDataCase2 = { issue: testIssue2, userId: user2._id.toString() }

    const msg = {
        ack: jest.fn()
    }

    return { listener, fakeDataCase1, fakeDataCase2, msg }
}

it('checking data has been deleted in database where user created problem with case 1', async () => {
    const { listener, fakeDataCase1, msg } = await setUp()

    await listener(fakeDataCase1, msg)

    const issueData = await issueModel.findById(testIssue2._id.toString())

    expect(issueData).toEqual(null)

    const commentData = await commentModel.find({})

    expect(commentData.length).toEqual(2)
})

it('checking data has been deleted in database where user only belongs to this problemwith case 2', async () => {
    const { listener, fakeDataCase2, msg } = await setUp()

    await listener(fakeDataCase2, msg)

    const issueData = await issueModel.find({})

    expect(issueData.length).toEqual(2)

    const commentData = await commentModel.find({})

    expect(commentData.length).toEqual(4)
})


it('acks the event with case 1', async () => {
    const { listener, fakeDataCase1, msg } = await setUp()

    await listener(fakeDataCase1, msg)

    expect(msg.ack).toHaveBeenCalled()
})

it('acks the event with case 2', async () => {
    const { listener, fakeDataCase2, msg } = await setUp()

    await listener(fakeDataCase2, msg)

    expect(msg.ack).toHaveBeenCalled()
})