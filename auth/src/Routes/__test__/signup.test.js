const request = require('supertest')
const app = require('../../app')
const natsWrapper = require("../../nats-wrapper")
const userModel = require('../../models/users')
it("returns 201 when signing up is successful", async () => {
    return await request(app)
        .post('/api/users/signup')
        .send({
            username: "testuser123",
            email: "testuser@gmail.com",
            password: "1234aA"
        })
        .expect(201)
})

it("returns 400 if email is already existed", async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            username: "testuser123",
            email: "testuser@gmail.com",
            password: "1234aA"
        })
        .expect(201)
    return await request(app)
        .post('/api/users/signup')
        .send({
            username: "longlee",
            email: "testuser@gmail.com",
            password: "1234aA"
        })
        .expect(400)
})
it("returns 400 if username is already existed", async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            username: "testuser123",
            email: "testuser@gmail.com",
            password: "1234aA"
        })
        .expect(201)
    return await request(app)
        .post('/api/users/signup')
        .send({
            username: "testuser123",
            email: "longle@gmail.com",
            password: "1234aA"
        })
        .expect(400)
})
it("emits an event created a user", async () => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            username: "testuser123",
            email: "testuser@gmail.com",
            password: "1234aA"
        })
        .expect(201)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it("check whether user is stored in database or not", async () => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            username: "testuser",
            email: "testuser@gmail.com",
            password: "1234aA"
        })
        .expect(201)
    const currentUser = await userModel.find({ email: "testuser@gmail.com" })
    expect(currentUser[0].email).toEqual("testuser@gmail.com")
})