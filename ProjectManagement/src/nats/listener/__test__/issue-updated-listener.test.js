const { default: mongoose } = require('mongoose')
const issueModel = require('../../../models/issueModel')
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
        //tien hanh luu vao database sau khi lay du lieu thanh cong
        const updatedIssue = {
            priority: data.priority,
            positionList: data.positionList,
            issueType: data.issueType,
            issueStatus: data.issueStatus,
            assignees: data.assignees
        }
        await issueModel.updateOne({ _id: data._id }, updatedIssue)
        msg.ack()
    }

    const fakeData = {
        _id: testIssue._id,
        projectId: testIssue.projectId,
        creator: testIssue.creator,
        priority: 2,
        timeSpent: 1,
        timeRemaining: 1,
        timeOriginalEstimate: 1,
        issueType: 2
    }

    const msg = {
        ack: jest.fn()
    }

    return { listener, fakeData, testIssue, msg }
}

it('check whether data has been stored in database or not', async () => {
    const { listener, fakeData, testIssue, msg } = await setUp()

    await listener(fakeData, msg)

    const data = await issueModel.findById(fakeData._id.toString())
    expect(data).toBeDefined()
    expect(data.priority).not.toEqual(testIssue.priority)
    expect(data.issueType).not.toEqual(testIssue.issueType)
    expect(data.timeSpent).toEqual(testIssue.timeSpent)
})

it('acks the event', async () => {
    const { listener, fakeData, msg } = await setUp()

    await listener(fakeData, msg)

    expect(msg.ack).toHaveBeenCalled()
})