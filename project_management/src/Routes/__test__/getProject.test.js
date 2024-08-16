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

const createIssue = async (creator, projectId, assignees, shortSummary) => {
    return await issueModel.create({
        projectId,
        creator,
        priority: 0,
        timeSpent: 1,
        timeRemaining: 1,
        timeOriginalEstimate: 1,
        shortSummary,
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
it('returns 400 if id is invalid', async () => {
    return await request(app)
        .get("/api/projectmanagement/1")
        .expect(400)
})
it('returns 200 if getting successfully project with empty keyword', async () => {
    const user1 = await createUser("testuser1")
    const user2 = await createUser("testuser2")
    const user3 = await createUser("testuser3")

    const issue1 = await createIssue(
        user1._id,
        projectId1,
        [user2._id, user3._id],
        "issue1"
    )
    const issue2 = await createIssue(
        user2._id,
        projectId2,
        [user3._id],
        "test dự án"
    )
    const issue3 = await createIssue(
        user2._id,
        projectId2,
        [user3._id],
        "demo dự án"
    )
    const issue4 = await createIssue(
        user2._id,
        projectId2,
        [user3._id],
        "test"
    )
    const category = await createCategory()
    const project1 = await createProject(
        [issue1._id, issue2._id, issue3._id, issue4._id],
        [user2._id, user3._id],
        user1._id,
        projectId1,
        category._id,
    )

    const response = await request(app)
        .get(`/api/projectmanagement/${project1._id.toString()}?keyword=`)
        .expect(200)

    const data = response.body.data
    expect(data.issues.length).toEqual(4)
})

it('returns 200 if getting successfully project with test keyword', async () => {
    const user1 = await createUser("testuser1")
    const user2 = await createUser("testuser2")
    const user3 = await createUser("testuser3")

    const issue1 = await createIssue(
        user1._id,
        projectId1,
        [user2._id, user3._id],
        "issue1"
    )
    const issue2 = await createIssue(
        user2._id,
        projectId2,
        [user3._id],
        "test dự án"
    )
    const issue3 = await createIssue(
        user2._id,
        projectId2,
        [user3._id],
        "demo dự án"
    )
    const issue4 = await createIssue(
        user2._id,
        projectId2,
        [user3._id],
        "test"
    )
    const category = await createCategory()
    const project1 = await createProject(
        [issue1._id, issue2._id, issue3._id, issue4._id],
        [user2._id, user3._id],
        user1._id,
        projectId1,
        category._id,
    )

    const response = await request(app)
        .get(`/api/projectmanagement/${project1._id.toString()}?keyword=test`)
        .expect(200)

    const data = response.body.data
    expect(data.issues.length).toEqual(2)
})