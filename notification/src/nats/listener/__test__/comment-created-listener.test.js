const { default: mongoose } = require("mongoose")
const issueModel = require("../../../models/issueModel")
const commentModel = require("../../../models/commentModel")

const setUp = async () => {

    const testIssue = await issueModel.create({
        projectId: new mongoose.Types.ObjectId().toHexString(),
        creator: new mongoose.Types.ObjectId().toHexString(),
        priority: 0,
        timeSpent: 1,
        timeRemaining: 1,
        timeOriginalEstimate: 1,
        shortSummary: "Day la noi dung tom tat",
        issueType: 0
    })

    const listener = async (data, msg) => {
        // tien hanh them comment ID nay vao IssueModel tuong ung
        const currentIssue = await issueModel.findOne({ _id: data.issueId })
        if (currentIssue) {
            const comment = await commentModel.create({
                _id: data._id,
                content: data.content,
                creator: data.creator
            })
            listComments = currentIssue.comments
            listComments.push(comment._id)
            await issueModel.updateOne({ _id: data.issueId }, { $set: { comments: listComments } })
        }
        msg.ack()
    }

    const fakeData = {
        _id: new mongoose.Types.ObjectId().toHexString(),
        content: "testuser\'s comments",
        creator: new mongoose.Types.ObjectId().toHexString(),
        issueId: testIssue._id.toString()
    }

    const msg = {
        ack: jest.fn()
    }

    return { listener, fakeData, msg }
}

it('check whether data has been stored in database or not', async () => {
    const { listener, fakeData, msg } = await setUp()

    await listener(fakeData, msg)   

    const issueData = await issueModel.find({})

    expect(issueData[0]).toBeDefined()
    expect(issueData[0].comments.length).toEqual(1)

    const commentData = await commentModel.find({})

    expect(commentData[0]).toBeDefined()
    expect(commentData[0].content).toEqual("testuser\'s comments")
})

it("checking data has not been stored in database if issue does not exist", async () => {
    const { listener, fakeData, msg } = await setUp()

    //set up new id for issue
    fakeData.issueId = new mongoose.Types.ObjectId().toHexString()

    await listener(fakeData, msg)

    const issueData = await issueModel.findById(fakeData.issueId)

    expect(issueData).toEqual(null)

    const commentData = await commentModel.findById(fakeData._id.toString())

    expect(commentData).toEqual(null)
})

it('acks the event', async () => {
    const { listener, fakeData, msg } = await setUp()

    await listener(fakeData, msg)

    expect(msg.ack).toHaveBeenCalled()
})