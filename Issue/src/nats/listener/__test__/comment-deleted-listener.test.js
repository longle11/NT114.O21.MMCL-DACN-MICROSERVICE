const { default: mongoose } = require("mongoose")
const issueModel = require("../../../models/issueModel")
const commentModel = require("../../../models/commentModel")

const setUp = async () => {
    const commentData1 = await commentModel.create({
        creator: new mongoose.Types.ObjectId().toHexString(),
        content: "Comment 1"
    })

    const commentData2 = await commentModel.create({
        creator: new mongoose.Types.ObjectId().toHexString(),
        content: "Comment 2"
    })

    const testIssue = await issueModel.create({
        projectId: new mongoose.Types.ObjectId().toHexString(),
        creator: new mongoose.Types.ObjectId().toHexString(),
        priority: 0,
        timeSpent: 1,
        timeRemaining: 1,
        timeOriginalEstimate: 1,
        shortSummary: "Day la noi dung tom tat",
        issueType: 0,
        comments: [commentData1._id, commentData2._id]
    })

    const listener = async (data, msg) => {
        //tien hanh them comment ID nay vao IssueModel tuong ung
        const currentIssue = await issueModel.findById(data.issueId)

        if (currentIssue) {
            //tiến hành lưu vào comment db
            await commentModel.deleteOne({ _id: data._id })
            listComments = currentIssue.comments
            const index = listComments.findIndex(id => id === data.issueId)
            listComments.splice(index, 1)
            await issueModel.updateMany({ _id: data.issueId }, { $set: { comments: listComments } })
        }
        msg.ack()
    }

    const fakeData = { _id: commentData2._id.toString(), issueId: testIssue._id.toString() }

    const msg = {
        ack: jest.fn()
    }

    return { listener, fakeData, msg }
}

it('check whether data has been stored in database or not', async () => {
    const { listener, fakeData, msg } = await setUp()

    await listener(fakeData, msg)

    const commentData = await commentModel.find({})

    expect(commentData).toBeDefined()
    expect(commentData.length).toEqual(1)

    const issueData = await issueModel.find({})

    expect(issueData).toBeDefined()
    expect(issueData[0].comments.length).toEqual(1)
})


it('acks the event', async () => {
    const { listener, fakeData, msg } = await setUp()

    await listener(fakeData, msg)

    expect(msg.ack).toHaveBeenCalled()
})