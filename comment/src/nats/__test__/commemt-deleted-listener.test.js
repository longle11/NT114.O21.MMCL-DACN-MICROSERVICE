const commentModel = require("../../models/commentModel")
const mongoose = require("mongoose")

let commentId1 = null

const createFakeComments = async () => {
    const cmt1 = await commentModel.create({
        issueId: new mongoose.Types.ObjectId().toHexString(),
        creator: new mongoose.Types.ObjectId().toHexString(),
        content: "message 1",
    })

    await commentModel.create({
        issueId: new mongoose.Types.ObjectId().toHexString(),
        creator: new mongoose.Types.ObjectId().toHexString(),
        content: "message 2",
    })

    commentId1 = cmt1._id
}

const setUp = async () => {
    //tao ra 1 trinh lang nghe
    const listener = async (data, msg) => {
        //tien hanh xoa cac comment lien quan
        await commentModel.deleteMany({ _id: { $in: data } })
        msg.ack()
    }

    //tao ra 1 data gia
    const fakeData = [commentId1]
    //tao ra 1 message gia
    const msg = {
        ack: jest.fn()
    }

    return { listener, fakeData, msg }
}

it('check whether data is being deleted by commentDeletedListener event', async () => {
    //tao ra cac comment gia va tien hanh luu vao co so du lieu
    await createFakeComments()
    //tien hanh lang nghe su kien 
    const { listener, fakeData, msg } = await setUp()

    await listener(fakeData, msg)
    const comment = await commentModel.findById(commentId1);
    expect(comment).toEqual(null);
})

it('acks the message', async() => {
    //tao ra cac comment gia va tien hanh luu vao co so du lieu
    await createFakeComments()
    //tien hanh lang nghe su kien 
    const { listener, fakeData, msg } = await setUp()
    await listener(fakeData, msg)
    expect(msg.ack).toHaveBeenCalled()
})