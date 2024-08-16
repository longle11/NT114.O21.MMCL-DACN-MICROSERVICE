const app = require('../../app')
const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const projectModel = require('../../models/projectModel')
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
        .post("/api/projectmanagement/create")
        .expect(401)
})

it('returns 400 if project is already existed', async () => {
    await request(app)
        .post("/api/projectmanagement/create")
        .set('Cookie', createFakeCookie())
        .send({
            nameProject: "Project 1",
            description: "Test dự án 1",
            category: new mongoose.Types.ObjectId().toHexString(),
            creator: userInfo().id
        })
        .expect(201)

    return await request(app)
        .post("/api/projectmanagement/create")
        .set('Cookie', createFakeCookie())
        .send({
            nameProject: "Project 1",
            description: "Test dự án 1",
            category: new mongoose.Types.ObjectId().toHexString(),
            creator: userInfo().id
        })
        .expect(400)
})

it('returns 201 if an project is successfully created', async () => {
    await request(app)
    .post("/api/projectmanagement/create")
    .set('Cookie', createFakeCookie())
    .send({
        nameProject: "Project 1",
        description: "Test dự án 1",
        category: new mongoose.Types.ObjectId().toHexString(),
        creator: userInfo().id
    })
    .expect(201)
})

it('check whether data has been stored in database or not', async() => {
    const response = await request(app)
    .post("/api/projectmanagement/create")
    .set('Cookie', createFakeCookie())
    .send({
        nameProject: "Project 1",
        description: "Test dự án 1",
        category: new mongoose.Types.ObjectId().toHexString(),
        creator: userInfo().id
    })
    .expect(201)

    const data = await projectModel.findById(response.body.data._id.toString())

    expect(data).toBeDefined()
    expect(data.nameProject).toEqual("Project 1")
})