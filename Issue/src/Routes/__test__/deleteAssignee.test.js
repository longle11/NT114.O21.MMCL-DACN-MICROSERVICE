const app = require('../../app')
const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const natswrapper = require('../../nats-wrapper')
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
        .put("/api/issue/delete/assignee/1")
        .expect(401)
})

it('returns 400 if id is invalid', async () => {
    return await request(app)
        .put("/api/issue/delete/assignee/1")
        .set('Cookie', createFakeCookie())
        .expect(400)
})

it('returns 201 if an issue is successfully deleted assignees', async () => {
    const assignee1 = new mongoose.Types.ObjectId().toHexString()
    const assignee2 = new mongoose.Types.ObjectId().toHexString()
    const assignee3 = new mongoose.Types.ObjectId().toHexString()

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
            assignees: [assignee1, assignee2, assignee3],
            issueType: 0
        })
        .expect(201)

    return await request(app)
        .put(`/api/issue/delete/assignee/${response.body.data._id}`)
        .set('Cookie', createFakeCookie())
        .send({userId: assignee2.toString()})
        .expect(201)
})


it('emits successfully an issues:updated event', async () => {
    const assignee1 = new mongoose.Types.ObjectId().toHexString()
    const assignee2 = new mongoose.Types.ObjectId().toHexString()
    const assignee3 = new mongoose.Types.ObjectId().toHexString()

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
            assignees: [assignee1, assignee2, assignee3],
            issueType: 0
        })
        .expect(201)

    await request(app)
        .put(`/api/issue/delete/assignee/${response.body.data._id}`)
        .set('Cookie', createFakeCookie())
        .send({userId: assignee2.toString()})
        .expect(201)

    expect(natswrapper.client.publish).toHaveBeenCalled()
})


//test user khong ton tai