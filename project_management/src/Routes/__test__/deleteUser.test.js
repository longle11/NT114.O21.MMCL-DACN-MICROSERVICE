const app = require('../../app')
const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const userModel = require('../../models/userModel')
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
        .put("/api/projectmanagement/insert/issue")
        .expect(401)
})

it('returns 200 if inserted successfully an issue to the project', async () => {

    const currentProject = await projectModel.create({
        nameProject: "Project 1",
        description: "Test dự án 1",
        category: new mongoose.Types.ObjectId().toHexString(),
        creator: userInfo().id
    })

    const issue = await issueModel.create({
        projectId: currentProject._id,
        creator: new mongoose.Types.ObjectId().toHexString(),
        priority: 0,
        timeSpent: 1,
        timeRemaining: 1,
        timeOriginalEstimate: 1,
        shortSummary: "Day la noi dung tom tat",
        issueType: 0,
    })

    return await request(app)
        .put("/api/projectmanagement/insert/issue")
        .set('Cookie', createFakeCookie())
        .send({ project_id: currentProject._id.toString(), issue_id: issue._id.toString() })
        .expect(200)
})
it('check whether data has been inserted to project or not', async () => {

    const currentProject = await projectModel.create({
        nameProject: "Project 1",
        description: "Test dự án 1",
        category: new mongoose.Types.ObjectId().toHexString(),
        creator: userInfo().id
    })

    const issue = await issueModel.create({
        projectId: currentProject._id,
        creator: new mongoose.Types.ObjectId().toHexString(),
        priority: 0,
        timeSpent: 1,
        timeRemaining: 1,
        timeOriginalEstimate: 1,
        shortSummary: "Day la noi dung tom tat",
        issueType: 0,
    })

    await request(app)
        .put("/api/projectmanagement/insert/issue")
        .set('Cookie', createFakeCookie())
        .send({ project_id: currentProject._id.toString(), issue_id: issue._id.toString() })
        .expect(200)

    const project = await projectModel.findById(currentProject._id.toString())

    expect(project).toBeDefined()
    expect(project.issues.length).toEqual(1)
})
