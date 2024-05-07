const app = require('../../app')
const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const natswrapper = require('../../nats-wrapper')
const commentModel = require('../../models/commentModel')
const issueModel = require('../../models/issueModel')
const userModel = require('../../models/userModel')
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

const createData = async () => {
    const user1 = await userModel.create({
        username: "testuser1",
        avatar: "https://ui-avatars.com/api/?name=testuser1"
    })

    const user2 = await userModel.create({
        username: "testuser2",
        avatar: "https://ui-avatars.com/api/?name=testuser2"
    })

    const comment1 = await commentModel.create({
        creator: user1._id,
        content: "comment 1"
    })

    const comment2 = await commentModel.create({
        creator: user1._id,
        content: "comment 2"
    })
    const comment3 = await commentModel.create({
        creator: new mongoose.Types.ObjectId().toHexString(),
        content: "comment 3"
    })
    const issueData = await issueModel.create({
        projectId: new mongoose.Types.ObjectId().toHexString(),
        creator: new mongoose.Types.ObjectId().toHexString(),
        priority: 0,
        timeSpent: 1,
        timeRemaining: 1,
        timeOriginalEstimate: 1,
        shortSummary: "Day la noi dung tom tat",
        issueType: 0,
        comments: [comment1._id, comment2._id, comment3._id],
        assignees: [user1._id, user2._id]
    })

    return { user1, user2, comment1, comment2, issueData }
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
    const { user1, issueData } = await createData()

    return await request(app)
        .put(`/api/issue/delete/assignee/${issueData._id.toString()}`)
        .set('Cookie', createFakeCookie())
        .send({ userId: user1._id.toString() })
        .expect(201)
})
it('emits successfully an event', async () => {
    const { user1, issueData } = await createData()

    await request(app)
        .put(`/api/issue/delete/assignee/${issueData._id.toString()}`)
        .set('Cookie', createFakeCookie())
        .send({ userId: user1._id.toString() })
        .expect(201)

    expect(natswrapper.client.publish).toHaveBeenCalled()
})
it('check whether data has been updated in issueModel database or not', async () => {
    const { user1, issueData } = await createData()

    await request(app)
    .put(`/api/issue/delete/assignee/${issueData._id.toString()}`)
    .set('Cookie', createFakeCookie())
    .send({ userId: user1._id.toString() })
    .expect(201)

    const data = await issueModel.findById(issueData._id.toString())
    console.log(data);

    expect(data).toBeDefined()
    expect(data.assignees.length).toEqual(1)
})
it('check whether data has been deleted in commentModel database or not', async () => {
    const { user1, issueData } = await createData()

    await request(app)
    .put(`/api/issue/delete/assignee/${issueData._id.toString()}`)
    .set('Cookie', createFakeCookie())
    .send({ userId: user1._id.toString() })
    .expect(201)

    const issuedt = await issueModel.findById(issueData._id.toString())

    expect(issuedt).toBeDefined()
    expect(issuedt.comments.length).toEqual(1)

    const commentdt = await commentModel.find({})

    expect(commentdt).toBeDefined()
    expect(commentdt.length).toEqual(1)
})