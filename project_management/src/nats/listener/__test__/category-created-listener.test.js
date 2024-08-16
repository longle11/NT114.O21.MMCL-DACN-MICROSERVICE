const mongoose = require('mongoose')
const categoryModel = require('../../../models/categoryModel')
const setUp = async () => {
    const listener = async (data, msg) => {
        for (let category of data) {
            await categoryModel.create({
                name: category
            })
        }
        msg.ack()
    }

    const fakeData = [
        "Kinh tế chính trị",
        "Công nghệ thực phẩm",
        "Mạng tính và truyền thông",
        "An toàn thông tin",
        "Khoa học máy tính",
        "Khoa học dữ liệu"
    ]

    const msg = {
        ack: jest.fn()
    }

    return { listener, fakeData, msg }
}

it('check whether data has been stored in database or not', async () => {
    const { listener, fakeData, msg } = await setUp()

    await listener(fakeData, msg)

    const data = await categoryModel.find({})

    expect(data.length).toEqual(6)
})

it('acks the event', async () => {
    const { listener, fakeData, msg } = await setUp()

    await listener(fakeData, msg)

    expect(msg.ack).toHaveBeenCalled()
})