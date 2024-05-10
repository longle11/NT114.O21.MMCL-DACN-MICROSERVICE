const app = require('../../app')
const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const natswrapper = require('../../nats-wrapper')
const issueModel = require('../../models/issueModel')
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
        .post("/api/issue/create")
        .send({
            projectId: new mongoose.Types.ObjectId().toHexString(),
            creator: new mongoose.Types.ObjectId().toHexString(),
            priority: 0,
            timeSpent: 1,
            timeRemaining: 1,
            timeOriginalEstimate: 1,
            shortSummary: "Day la noi dung tom tat",
            issueType: 0
        })
        .expect(401)
})

it('returns 201 if an issue is successfully created', async () => {
    await request(app)
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
            issueType: 0
        })
        .expect(201)
})

it('emits successfully an issues:created event', async () => {
    await request(app)
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
            issueType: 0
        })
        .expect(201)
    expect(natswrapper.client.publish).toHaveBeenCalled()
})

it('check whether data has been stored in database or not', async() => {
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
        issueType: 0
    })
    .expect(201)

    const data = await issueModel.findById(response.body.data._id.toString())

    expect(data).toBeDefined()
    expect(data.shortSummary).toEqual(response.body.data.shortSummary)
    expect(data.projectId.toString()).toEqual(response.body.data.projectId.toString())
    expect(data.creator.toString()).toEqual(response.body.data.creator.toString())
})