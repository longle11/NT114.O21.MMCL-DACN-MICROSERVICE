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
        await issueModel.deleteOne({ _id: data._id })
        msg.ack()
    }

    const fakeData = { _id: testIssue._id.toString() }

    const msg = {
        ack: jest.fn()
    }

    return { listener, fakeData, msg }
}

it('check whether data has been stored in database or not', async () => {
    const { listener, fakeData, msg } = await setUp()

    await listener(fakeData, msg)

    const data = await issueModel.findById(fakeData.id)

    expect(data).toEqual(null)
})

it('acks the event', async () => {
    const { listener, fakeData, msg } = await setUp()

    await listener(fakeData, msg)

    expect(msg.ack).toHaveBeenCalled()
})