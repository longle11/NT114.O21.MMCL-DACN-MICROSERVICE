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
        .put("/api/projectmanagement/update/1")
        .expect(401)
})

it('returns 400 if project is not found', async () => {
    await request(app)
        .put("/api/projectmanagement/update/1")
        .set('Cookie', createFakeCookie())
        .send({
            props: {
                nameProject: "Project 1",
                description: "Test dự án 1",
                category: new mongoose.Types.ObjectId().toHexString()
            }
        })
        .expect(400)
})

it('returns 200 if an project is successfully updated', async () => {
    const currentProject = await projectModel.create({
        nameProject: "Project 1",
        description: "Test dự án 1",
        category: new mongoose.Types.ObjectId().toHexString(),
        creator: userInfo().id
    })

    return await request(app)
        .put(`/api/projectmanagement/update/${currentProject._id.toString()}`)
        .set('Cookie', createFakeCookie())
        .send({
            props: {
                nameProject: "updated project name",
                description: "updated description",
                category: new mongoose.Types.ObjectId().toHexString(),
            }
        })
        .expect(200)
})

it('check whether data has been updated in database or not', async () => {
    const currentProject = await projectModel.create({
        nameProject: "Project 1",
        description: "Test dự án 1",
        category: new mongoose.Types.ObjectId().toHexString(),
        creator: userInfo().id
    })

    await request(app)
        .put(`/api/projectmanagement/update/${currentProject._id.toString()}`)
        .set('Cookie', createFakeCookie())
        .send({
            props: {
                nameProject: "updated project name",
                description: "updated description",
                category: new mongoose.Types.ObjectId().toHexString(),
            }
        })
        .expect(200)

    const data = await projectModel.findById(currentProject._id.toString())
    expect(data).toBeDefined()
    expect(data.nameProject).not.toEqual(currentProject.nameProject)
    expect(data.description).not.toEqual(currentProject.description)
    expect(data.category).not.toEqual(currentProject.category)
})