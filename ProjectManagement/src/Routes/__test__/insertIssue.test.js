const app = require('../../app')
const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const userModel = require('../../models/userModel')
const projectModel = require('../../models/projectModel')
const issueModel = require('../../models/issueModel')
const natsWrapper = require('../../nats-wrapper')


const projectId = new mongoose.Types.ObjectId().toHexString()

const createProject = async (issues, members) => {
    return await projectModel.create({
        _id: projectId,
        nameProject: "Project 1",
        description: "Test dự án 1",
        category: new mongoose.Types.ObjectId().toHexString(),
        creator: userInfo().id,
        issues,
        members
    })
}

const createIssue = async (creator, projectId, assignees) => {
    return await issueModel.create({
        projectId,
        creator,
        priority: 0,
        timeSpent: 1,
        timeRemaining: 1,
        timeOriginalEstimate: 1,
        shortSummary: "Day la noi dung tom tat",
        issueType: 0,
        assignees
    })
}
const createUser = async (username) => {
    return await userModel.create({
        username,
        avatar: `https://ui-avatars.com/api/?name=${username}`
    })
}

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
        .send({ userId: testuser1._id.toString() })
        .expect(200)
})

it('check whether data is deleted in projectModel database or not with issues', async () => {
    const user1 = await createUser("testuser1")
    const user2 = await createUser("testuser2")
    const user3 = await createUser("testuser3")

    await createProject(
        [],
        [user1._id, user2._id, user3._id]
    )

    await request(app)
        .put(`/api/projectmanagement/delete/user/${projectId.toString()}`)
        .set('Cookie', createFakeCookie())
        .send({ userId: user1._id.toString() })
        .expect(200)

    const data = await projectModel.findById(projectId)

    expect(data).toBeDefined()
    expect(data.members.length).toEqual(2)
})

it('check whether data is deleted in issueModel database or not in case that user is a person who created that issue', async () => {
    const user1 = await createUser("testuser1")
    const user2 = await createUser("testuser2")
    const user3 = await createUser("testuser3")


    const issue1 = await createIssue(
        user1._id,
        projectId,
        [user2._id, user3._id]
    )

    const issue2 = await createIssue(
        user2._id,
        projectId,
        [user3._id]
    )

    await createProject(
        [issue1._id, issue2._id],
        [user1._id, user2._id, user3._id]
    )

    await request(app)
        .put(`/api/projectmanagement/delete/user/${projectId.toString()}`)
        .set('Cookie', createFakeCookie())
        .send({ userId: user1._id.toString() })
        .expect(200)

    const data = await issueModel.find({})
    expect(data).toBeDefined()
    expect(data.length).toEqual(1)
})

it('acks the event if user is a person who created issues', async () => {
    const user1 = await createUser("testuser1")
    const user2 = await createUser("testuser2")
    const user3 = await createUser("testuser3")


    const issue1 = await createIssue(
        user1._id,
        projectId,
        [user2._id, user3._id]
    )

    const issue2 = await createIssue(
        user2._id,
        projectId,
        [user3._id]
    )

    await createProject(
        [issue1._id, issue2._id],
        [user1._id, user2._id, user3._id]
    )

    await request(app)
        .put(`/api/projectmanagement/delete/user/${projectId.toString()}`)
        .set('Cookie', createFakeCookie())
        .send({ userId: user1._id.toString() })
        .expect(200)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('check whether data is deleted in issueModel database or not in case that user is a person who only belongs to that issue', async () => {
    const user1 = await createUser("testuser1")
    const user2 = await createUser("testuser2")
    const user3 = await createUser("testuser3")


    const issue1 = await createIssue(
        user2._id,
        projectId,
        [user1._id, user3._id]
    )

    const issue2 = await createIssue(
        user2._id,
        projectId,
        [user3._id]
    )

    await createProject(
        [issue1._id, issue2._id],
        [user1._id, user2._id, user3._id]
    )

    await request(app)
        .put(`/api/projectmanagement/delete/user/${projectId.toString()}`)
        .set('Cookie', createFakeCookie())
        .send({ userId: user1._id.toString() })
        .expect(200)

    const data = await issueModel.find({})
    expect(data).toBeDefined()
    expect(data.length).toEqual(2)

    const issue1CheckingUser = await issueModel.findById(issue1._id.toString())
    expect(issue1CheckingUser).toBeDefined()
    expect(issue1CheckingUser.assignees.length).toEqual(1)
})

it('acks the event if user is a person who only belongs to issues', async () => {
    const user1 = await createUser("testuser1")
    const user2 = await createUser("testuser2")
    const user3 = await createUser("testuser3")


    const issue1 = await createIssue(
        user2._id,
        projectId,
        [user1._id, user3._id]
    )

    const issue2 = await createIssue(
        user2._id,
        projectId,
        [user3._id]
    )

    await createProject(
        [issue1._id, issue2._id],
        [user1._id, user2._id, user3._id]
    )

    await request(app)
        .put(`/api/projectmanagement/delete/user/${projectId.toString()}`)
        .set('Cookie', createFakeCookie())
        .send({ userId: user1._id.toString() })
        .expect(200)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
})