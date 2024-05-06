const { default: mongoose } = require('mongoose')
const userModel = require('../../../models/userModel')
const setUp = async () => {
    const listener = async (data, msg) => {
        //tiến hành lưu vào auth db
        await userModel.create({
            _id: data._id,
            username: data.username,
            avatar: data.avatar
        })

        msg.ack()
    }

    const fakeData = {
        _id: new mongoose.Types.ObjectId().toHexString(),
        username: "testuser",
        avatar: "https://ui-avatars.com/api/?name=testuser"
    }

    const msg = {
        ack: jest.fn()
    }

    return { listener, fakeData, msg }
}

it('check whether data has been stored in database or not', async () => {
    const { listener, fakeData, msg } = await setUp()

    await listener(fakeData, msg)

    const data = await userModel.find({})

    expect(data[0]).toBeDefined()
    expect(data[0].username).toEqual("testuser")
})

it('acks the event', async() => {
    const { listener, fakeData, msg } = await setUp()

    await listener(fakeData, msg)

    expect(msg.ack).toHaveBeenCalled()
})