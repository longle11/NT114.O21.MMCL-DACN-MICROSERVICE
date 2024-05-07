const app = require('../../app')
const request = require('supertest')
const mongoose = require('mongoose')
const projectModel = require('../../models/projectModel')
const issueModel = require('../../models/issueModel')
const userModel = require('../../models/userModel')
const categoryModel = require('../../models/categoryModel')

const projectId1 = new mongoose.Types.ObjectId().toHexString()
const projectId2 = new mongoose.Types.ObjectId().toHexString()
const createProject = async (issues, members, creator, _id, category) => {
    return await projectModel.create({
        _id,
        nameProject: "Project 1",
        description: "Test dự án 1",
        category,
        creator,
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

const createCategory = async () => {
    return await categoryModel.create({
        name: "lập trình android"
    })
}

const createUser = async (username) => {
    return await userModel.create({
        username,
        avatar: `https://ui-avatars.com/api/?name=${username}`
    })
}
it('returns 401 if authentication is failed', async () => {
    return await request(app)
        .post("/api/projectmanagement/create")
        .expect(401)
})
it('returns 200 if getting successfully list', async () => {
    const user1 = await createUser("testuser1")
    const user2 = await createUser("testuser2")
    const user3 = await createUser("testuser3")

    const issue1 = await createIssue(
        user1._id,
        projectId1,
        [user2._id, user3._id]
    )
    const issue2 = await createIssue(
        user2._id,
        projectId2,
        [user3._id]
    )
    const category = await createCategory()
    await createProject(
        [issue1._id, issue2._id],
        [user2._id, user3._id],
        user1._id,
        projectId1,
        category._id
    )

    await createProject(
        [issue2._id],
        [user2._id, user3._id],
        user1._id,
        projectId2,
        category._id
    )
    const response = await request(app)
        .get('/api/projectmanagement/list')
        .expect(200)
    const data = response.body.data
    expect(data).toBeDefined()
    expect(data.length).toEqual(2)
    expect(data[0].creator.username).toEqual(user1.username)
    expect(data[0].issues[0].shortSummary).toEqual(issue1.shortSummary)
    expect(data[0].members[0].username).toEqual(user2.username)
    expect(data[0].category.name).toEqual(category.name)
})