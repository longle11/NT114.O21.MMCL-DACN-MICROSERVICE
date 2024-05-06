const { default: mongoose } = require('mongoose')
const issueModel = require('../../../models/issueModel')
const setUp = async () => {
    const listener = async (data, msg) => {
        //tien hanh luu vao database sau khi lay du lieu thanh cong
        await issueModel.create(data)
        msg.ack()
    }

    const fakeData ={
        projectId: new mongoose.Types.ObjectId().toHexString(),
        creator: new mongoose.Types.ObjectId().toHexString(),
        priority: 0,
        timeSpent: 1,
        timeRemaining: 1,
        timeOriginalEstimate: 1,
        shortSummary: "Day la noi dung tom tat",
        issueType: 0
    }

    const msg = {
        ack: jest.fn()
    }

    return { listener, fakeData, msg }
}

it('check whether data has been stored in database or not', async () => {
    const { listener, fakeData, msg } = await setUp()

    await listener(fakeData, msg)

    const data = await issueModel.find({projectId: fakeData.projectId.toString()})

    expect(data[0]).toBeDefined()
    expect(data[0].projectId.toString()).toEqual(fakeData.projectId.toString())
    expect(data[0].creator.toString()).toEqual(fakeData.creator.toString())
    expect(data[0].shortSummary.toString()).toEqual(fakeData.shortSummary.toString())
})

it('acks the event', async () => {
    const { listener, fakeData, msg } = await setUp()

    await listener(fakeData, msg)

    expect(msg.ack).toHaveBeenCalled()
})