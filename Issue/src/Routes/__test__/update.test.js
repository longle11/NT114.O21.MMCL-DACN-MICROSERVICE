const app = require('../../app')
const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const natswrapper = require('../../nats-wrapper')
const userModel = require('../../models/userModel')
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
        .put("/api/issue/update/1")
        .expect(401)
})


it('returns 400 if id\'s issue is invalid', async () => {
    return await request(app)
        .put("/api/issue/update/1")
        .set('Cookie', createFakeCookie())
        .expect(400)
})


it('returns 200 if an issue is successfully updated', async () => {
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

    const testuser1 = await userModel.create({
        email: "testuser1@gmail.com",
        username: "testuser1",
        avatar: "https://ui-avatars.com/api/?name=testuser1"
    })

    let getIssue = response.body.data

    getIssue.shortSummary = "test moi nhat"
    getIssue.assignees.push(testuser1._id)

    return await request(app)
        .put(`/api/issue/update/${response.body.data._id.toString()}`)
        .set('Cookie', createFakeCookie())
        .send(getIssue)
        .expect(200)
})

it('emits successfully an issues:created event', async () => {
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

    const testuser1 = await userModel.create({
        email: "testuser1@gmail.com",
        username: "testuser1",
        avatar: "https://ui-avatars.com/api/?name=testuser1"
    })

    let getIssue = response.body.data

    getIssue.shortSummary = "test moi nhat"
    getIssue.assignees.push(testuser1._id)

    await request(app)
        .put(`/api/issue/update/${response.body.data._id.toString()}`)
        .set('Cookie', createFakeCookie())
        .send(getIssue)
        .expect(200)

    expect(natswrapper.client.publish).toHaveBeenCalled()
})

it('check whether data has been updated in database or not', async() => {
    const user1 = await userModel.create({
        username: "testuser1",
        avatar: "https://ui-avatars.com/api/?name=testuser1"
    })

    const user2 = await userModel.create({
        username: "testuser2",
        avatar: "https://ui-avatars.com/api/?name=testuser2"
    })
    const user3 = await userModel.create({
        username: "testuser3",
        avatar: "https://ui-avatars.com/api/?name=testuser3"
    })
    const user4 = await userModel.create({
        username: "testuser4",
        avatar: "https://ui-avatars.com/api/?name=testuser4"
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
        assignees: [user1._id]
    })
    let testInsertUserIntoProject = {
        projectId: issueData.projectId,
        creator: issueData.creator,
        priority: issueData.priority,
        timeSpent: issueData.timeSpent,
        timeRemaining: issueData.timeRemaining,
        timeOriginalEstimate: issueData.timeOriginalEstimate,
        shortSummary: issueData.shortSummary,
        issueType: issueData.issueType,
        assignees: [user2._id, user3._id, user4._id]
    }
    await request(app)
        .put(`/api/issue/update/${issueData._id.toString()}`)
        .set('Cookie', createFakeCookie())
        .send(testInsertUserIntoProject)
        .expect(200)
    
    const data = await issueModel.findById(issueData._id.toString())

    expect(data).toBeDefined()
    expect(data.assignees.length).toEqual(4)
})