const app = require('../../app')
const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const natsWrapper = require('../../nats-wrapper')
const projectModel = require('../../models/projectModel')
const issueModel = require('../../models/issueModel')
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

it('returns 401 if authentication is failed', async () => {
    return await request(app)
        .delete("/api/projectmanagement/delete/1")
        .expect(401)
})

it('returns 400 if project is not found', async () => {
    return await request(app)
        .delete("/api/projectmanagement/delete/1")
        .set('Cookie', createFakeCookie())
        .expect(400)
})

it('returns 200 if an project is successfully deleted (only project without deleted issues)', async () => {
    const project = await projectModel.create({
        nameProject: "Project 1",
        description: "Test dự án 1",
        category: new mongoose.Types.ObjectId().toHexString(),
        creator: userInfo().id
    })

    return await request(app)
        .delete(`/api/projectmanagement/delete/${project._id.toString()}`)
        .set('Cookie', createFakeCookie())
        .expect(200)
})

it('emits the event', async () => {
    const issueData1 = await issueModel.create({
        projectId: new mongoose.Types.ObjectId().toHexString(),
        creator: new mongoose.Types.ObjectId().toHexString(),
        priority: 0,
        timeSpent: 1,
        timeRemaining: 1,
        timeOriginalEstimate: 1,
        shortSummary: "Day la noi dung tom tat 2",
        issueType: 0,
    })
    const issueData2 = await issueModel.create({
        projectId: new mongoose.Types.ObjectId().toHexString(),
        creator: new mongoose.Types.ObjectId().toHexString(),
        priority: 0,
        timeSpent: 1,
        timeRemaining: 1,
        timeOriginalEstimate: 1,
        shortSummary: "Day la noi dung tom tat 2",
        issueType: 0,
    })
    const project = await projectModel.create({
        nameProject: "Project 1",
        description: "Test dự án 1",
        category: new mongoose.Types.ObjectId().toHexString(),
        creator: userInfo().id,
        issues: [issueData1._id, issueData2._id]
    })

    console.log("vao được ngang này nè 12");

    await request(app)
        .delete(`/api/projectmanagement/delete/${project._id.toString()}`)
        .set('Cookie', createFakeCookie())
        .expect(200)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('check whether data has been deleted in project without issues', async () => {
    const project = await projectModel.create({
        nameProject: "Project 1",
        description: "Test dự án 1",
        category: new mongoose.Types.ObjectId().toHexString(),
        creator: userInfo().id,
    })

    await request(app)
        .delete(`/api/projectmanagement/delete/${project._id.toString()}`)
        .set('Cookie', createFakeCookie())
        .expect(200)

    const data = await projectModel.findById(project._id.toString())

    expect(data).toEqual(null)
})

it('check whether data has been deleted in project with issues', async () => {
    const issueData1 = await issueModel.create({
        projectId: new mongoose.Types.ObjectId().toHexString(),
        creator: new mongoose.Types.ObjectId().toHexString(),
        priority: 0,
        timeSpent: 1,
        timeRemaining: 1,
        timeOriginalEstimate: 1,
        shortSummary: "Day la noi dung tom tat 2",
        issueType: 0,
    })
    const issueData2 = await issueModel.create({
        projectId: new mongoose.Types.ObjectId().toHexString(),
        creator: new mongoose.Types.ObjectId().toHexString(),
        priority: 0,
        timeSpent: 1,
        timeRemaining: 1,
        timeOriginalEstimate: 1,
        shortSummary: "Day la noi dung tom tat 2",
        issueType: 0,
    })
    const project = await projectModel.create({
        nameProject: "Project 1",
        description: "Test dự án 1",
        category: new mongoose.Types.ObjectId().toHexString(),
        creator: userInfo().id,
        issues: [issueData1._id, issueData2._id]
    })

    await request(app)
        .delete(`/api/projectmanagement/delete/${project._id.toString()}`)
        .set('Cookie', createFakeCookie())
        .expect(200)

    const data = await projectModel.findById(project._id.toString())

    expect(data).toEqual(null)

    const issueData = await issueModel.find({})
    expect(issueData.length).toEqual(0)
})