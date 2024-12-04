const { default: mongoose } = require("mongoose")
const commentModel = require("../../../models/commentModel")

const setUp = async () => {
    const commentData1 = await commentModel.create({
        creator: new mongoose.Types.ObjectId().toHexString(),
        content: "Comment 1"
    })

    const listener = async (data, msg) => {
        //tiến hành lưu vào comment db
        await commentModel.updateOne({ _id: data._id }, { content: data.content, timeStamp: data.timeStamp, isModified: data.isModified })

        msg.ack()
    }

    const fakeData = {
        _id: commentData1._id.toString(),
        content: "updated",
        timeStamp: new Date(),
        isModified: true
    }

    const msg = {
        ack: jest.fn()
    }

    return { listener, fakeData, msg, commentData1 }
}

it('check whether data has been updated in database or not', async () => {
    const { listener, fakeData, msg, commentData1 } = await setUp()

    await listener(fakeData, msg)

    const commentData = await commentModel.findById(fakeData._id)

    expect(commentData.content).not.toEqual(commentData1.content)
    expect(commentData.timeStamp).not.toEqual(commentData1.timeStamp)
    expect(commentData.isModified).not.toEqual(commentData1.isModified)
})


it('acks the event', async () => {
    const { listener, fakeData, msg } = await setUp()

    await listener(fakeData, msg)

    expect(msg.ack).toHaveBeenCalled()
})