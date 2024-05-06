const app = require('../../app')
const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const natsWrapper = require('../../nats-wrapper')
const commentModel = require('../../models/commentModel')

const createFakeCookie = () => {
    const userInfo = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: "testuser@gmail.com",
        username: "testuser",
        avatar: "https://ui-avatars.com/api/?name=testuser"
    }

    const token = jwt.sign(userInfo, process.env.JWT_KEY)

    //buid a session
    const session = { jwt: token }

    //turn that session into json
    const sessionJson = JSON.stringify(session)

    //take that json and base it as base 64
    const base64 = Buffer.from(sessionJson).toString('base64')

    return `session=${base64}`
}

it('returns 401 if authentication is failed', async () => {
    return await request(app)
        .put("/api/comments/update/1")
        .expect(401)
})
it('returns 200 if comment is successfully updated', async() => {
    const response = await request(app)
        .post("/api/comments/create")
        .set('Cookie', createFakeCookie())
        .send({
            issueId: new mongoose.Types.ObjectId().toHexString(),
            creator: new mongoose.Types.ObjectId().toHexString(),
            content: "Day la 1 bai test"
        })
        .expect(201)
    
    await request(app)
        .delete(`/api/comments/delete/${response.body.data._id}`)
        .set('Cookie', createFakeCookie())
        .send({
            content: "Noi dung da duoc thay doi",
            timeStamp: new Date()
        })
        .expect(200)
})

it("returns errors if failed updated with invaid ID", async ()=> {
    return await request(app)
        .put("/api/comments/update/1")
        .set('Cookie', createFakeCookie())
        .expect(400)
})

it('emits an comment:deleted event', async() => {
    const response = await request(app)
        .post("/api/comments/create")
        .set('Cookie', createFakeCookie())
        .send({
            issueId: new mongoose.Types.ObjectId().toHexString(),
            creator: new mongoose.Types.ObjectId().toHexString(),
            content: "Day la 1 bai test"
        })
        .expect(201)
    await request(app)
        .put(`/api/comments/update/${response.body.data._id}`)
        .set('Cookie', createFakeCookie())
        .send({
            content: "Noi dung da duoc thay doi",
            timeStamp: new Date()
        })
        .expect(200)
    
    expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('check where data is updated in database or not', async() => {
    const comment1 = await commentModel.create({
        creator: new mongoose.Types.ObjectId().toHexString(),
        content: "day la noi dung 1"
    })

    await request(app)
        .put(`/api/comments/update/${comment1._id.toString()}`)
        .set('Cookie', createFakeCookie())
        .send({
            content: "updated",
            timeStamp: new Date()
        })
        .expect(200)

    const currentComment = await commentModel.findById(comment1._id.toString())
    expect(currentComment.content).toEqual("updated")
})