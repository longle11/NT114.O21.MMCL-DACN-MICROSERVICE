const app = require('../../app')
const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const userModel = require('../../models/userModel')
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
        .put("/api/projectmanagement/delete/user/1")
        .expect(401)
})

it('returns 400 if project is not found', async () => {
    return await request(app)
        .put("/api/projectmanagement/delete/user/1")
        .set('Cookie', createFakeCookie())
        .expect(400)
})

it('returns 200 if deleted successfully user to the project', async () => {
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

    return await request(app)
        .put(`/api/projectmanagement/delete/user/${currentProject._id.toString()}`)
        .set('Cookie', createFakeCookie())
        .send({userId: testuser1._id.toString()})
        .expect(200)
})
