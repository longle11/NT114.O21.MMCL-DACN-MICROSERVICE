const app = require('../../app')
const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const natswrapper = require('../../nats-wrapper')
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
        .post("/api/comments/create")
        .send({
            creator: "testuser",
            content: "Day la 1 bai test"
        })
        .expect(401)
})

it('returns 200 if comment is created', async() => {
    await request(app)
        .post("/api/comments/create")
        .set('Cookie', createFakeCookie())
        .send({
            issueId: new mongoose.Types.ObjectId().toHexString(),
            creator: new mongoose.Types.ObjectId().toHexString(),
            content: "Day la 1 bai test"
        })
        .expect(201)

})

it ('emits successfully an created event', async () => {
    await request(app)
        .post("/api/comments/create")
        .set('Cookie', createFakeCookie())
        .send({
            issueId: new mongoose.Types.ObjectId().toHexString(),
            creator: new mongoose.Types.ObjectId().toHexString(),
            content: "Day la 1 bai test"
        })
        .expect(201)

    expect(natswrapper.client.publish).toHaveBeenCalled()
})

it('check whether the data has been stored in the database or not', async() => {
    const response = await request(app)
    .post("/api/comments/create")
    .set('Cookie', createFakeCookie())
    .send({
        issueId: new mongoose.Types.ObjectId().toHexString(),
        creator: new mongoose.Types.ObjectId().toHexString(),
        content: "Day la 1 bai test"
    })
    .expect(201)


    const thisComment = await commentModel.find({content: "Day la 1 bai test"})
    expect(response.body.data._id).toEqual(thisComment[0]._id.toString())
})
