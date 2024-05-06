const { default: mongoose } = require("mongoose")
const issueModel = require("../../../models/issueModel")
const commentModel = require("../../../models/commentModel")
const issuePublisher = require("../../publisher/issue-publisher")

const setUp = async () => {
    const commentData1 = await commentModel.create({
        creator: new mongoose.Types.ObjectId().toHexString(),
        content: "Comment 1"
    })

    const commentData2 = await commentModel.create({
        creator: new mongoose.Types.ObjectId().toHexString(),
        content: "Comment 2"
    })

    const testIssue1 = await issueModel.create({
        projectId: new mongoose.Types.ObjectId().toHexString(),
        creator: new mongoose.Types.ObjectId().toHexString(),
        priority: 0,
        timeSpent: 1,
        timeRemaining: 1,
        timeOriginalEstimate: 1,
        shortSummary: "Day la noi dung tom tat van de 1",
        issueType: 0,
        comments: [commentData2._id]
    })

    const testIssue2 = await issueModel.create({
        projectId: new mongoose.Types.ObjectId().toHexString(),
        creator: new mongoose.Types.ObjectId().toHexString(),
        priority: 3,
        timeSpent: 2,
        timeRemaining: 1,
        timeOriginalEstimate: 5,
        shortSummary: "Day la noi dung tom tat van de 2",
        issueType: 0,
        comments: [commentData1._id]
    })

    const listener = async (data, msg) => {
        //lấy ra danh sách issue thuộc về project
        const issueList = await issueModel.find({ _id: { $in: data } })

        //tien hanh xoa cac comment trong cac issue nay
        for (const issue of issueList) {
            const deleteComments = await commentModel.deleteMany({ _id: { $in: issue.comments } })
            console.log(deleteComments);
            await issuePublisher(issue.comments, 'issue-comment:deleted')
        }

        //xoa cac issue thuoc project
        await issueModel.deleteMany({ _id: { $in: data } })

        msg.ack()
    }

    const fakeData = [testIssue1._id.toString(), testIssue2._id.toString()]

    const msg = {
        ack: jest.fn()
    }

    return { listener, fakeData, msg }
}

it('check whether data has been deleted in database or not', async () => {
    const { listener, fakeData, msg } = await setUp()

    await listener(fakeData, msg)

    const commentData = await commentModel.find({})

    expect(commentData.length).toEqual(0)

    const issueData = await issueModel.find({})

    expect(issueData.length).toEqual(0)
})


it('acks the event', async () => {
    const { listener, fakeData, msg } = await setUp()

    await listener(fakeData, msg)

    expect(msg.ack).toHaveBeenCalled()
})