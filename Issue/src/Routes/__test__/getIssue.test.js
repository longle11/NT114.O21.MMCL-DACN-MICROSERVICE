const app = require('../../app')
const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const commentModel = require('../../models/commentModel')
const userModel = require('../../models/userModel')

const userInfo = () => {
    return {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: "testuser@gmail.com",
        username: "testuser",
        avatar: "https://ui-avatars.com/api/?name=testuser"
    }
}
const createFakeCookie = () => {

    const token = jwt.sign(userInfo(), process.env.JWT_KEY)

    //buid a session
    const session = { jwt: token }

    //turn that session into json
    const sessionJson = JSON.stringify(session)

    //take that json and base it as base 64
    const base64 = Buffer.from(sessionJson).toString('base64')

    return `session=${base64}`
}

it('returns 400 if id is invalid', async () => {
    return await request(app)
        .get("/api/issue/1")
        .set('Cookie', createFakeCookie())
        .expect(400)
})

it('returns 200 if taking an issue is successful', async () => {
    const currentComment = await commentModel.create({
        creator: userInfo().id,
        content: 'day la 1 bai test nho'
    })

    const currentUser = await userModel.create({
        username: userInfo().username,
        _id: userInfo().id,
        avatar: userInfo().avatar
    })
    const response = await request(app)
        .post("/api/issue/create")
        .set('Cookie', createFakeCookie())
        .send({
            projectId: new mongoose.Types.ObjectId().toHexString(),
            creator: new mongoose.Types.ObjectId().toHexString(),
            priority: 0,
            timeSpent: 1,
            timeRemaining: 1,
            timeOriginalEstimate: 1,
            shortSummary: "Day la noi dung tom tat",
            issueType: 0,
            comments: [currentComment._id]
        })
        .expect(201)

    return await request(app)
        .get(`/api/issue/${response.body.data._id}`)
        .set('Cookie', createFakeCookie())
        .expect(200)
})

