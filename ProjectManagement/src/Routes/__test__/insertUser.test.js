const app = require('../../app')
const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const userModel = require('../../models/userModel')
const projectModel = require('../../models/projectModel')
const issueModel = require('../../models/issueModel')

const projectId = new mongoose.Types.ObjectId().toHexString()


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
        .post("/api/projectmanagement/insert")
        .expect(401)
})

it('returns 400 if project is not found', async () => {
    return await request(app)
        .post("/api/projectmanagement/insert")
        .set('Cookie', createFakeCookie())
        .send({ props: { project_id: 1, user_id: 1 } })
        .expect(400)
})

it('returns 200 if insterted successfully user to the project', async () => {
    const testuser1 = await userModel.create({
        id: new mongoose.Types.ObjectId().toHexString(),
        email: "testuser1@gmail.com",
        username: "testuser1",
        avatar: "https://ui-avatars.com/api/?name=testuser1"
    })

    const currentProject = await projectModel.create({
        nameProject: "Project 1",
        description: "Test dự án 1",
        category: new mongoose.Types.ObjectId().toHexString(),
        creator: userInfo().id
    })

    return await request(app)
        .post("/api/projectmanagement/insert")
        .set('Cookie', createFakeCookie())
        .send({ props: { project_id: currentProject._id.toString(), user_id: testuser1._id.toString() } })
        .expect(200)
})

it('check whether data is deleted in projectModel database or not with issues', async () => {
    const testuser1 = await userModel.create({
        id: new mongoose.Types.ObjectId().toHexString(),
        email: "testuser1@gmail.com",
        username: "testuser1",
        avatar: "https://ui-avatars.com/api/?name=testuser1"
    })

    const currentProject = await projectModel.create({
        nameProject: "Project 1",
        description: "Test dự án 1",
        category: new mongoose.Types.ObjectId().toHexString(),
        creator: userInfo().id
    })

    await request(app)
        .post("/api/projectmanagement/insert")
        .set('Cookie', createFakeCookie())
        .send({ props: { project_id: currentProject._id.toString(), user_id: testuser1._id.toString() } })
        .expect(200)

    const data = await projectModel.findById(currentProject._id.toString())

    expect(data).toBeDefined()
    expect(data.members.length).toEqual(1)
})
it('check whether user is already existed in this project or not', async () => {
    const testuser1 = await userModel.create({
        id: new mongoose.Types.ObjectId().toHexString(),
        email: "testuser1@gmail.com",
        username: "testuser1",
        avatar: "https://ui-avatars.com/api/?name=testuser1"
    })

    const currentProject = await projectModel.create({
        nameProject: "Project 1",
        description: "Test dự án 1",
        category: new mongoose.Types.ObjectId().toHexString(),
        creator: userInfo().id,
        members: [testuser1._id]
    })

    const response = await request(app)
        .post("/api/projectmanagement/insert")
        .set('Cookie', createFakeCookie())
        .send({ props: { project_id: currentProject._id.toString(), user_id: testuser1._id.toString() } })
        .expect(400)
    expect(response._body.message).toEqual("User is already existed in this project")
})