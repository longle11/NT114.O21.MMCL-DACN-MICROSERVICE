const request = require('supertest')
const app = require('../../app')
const userModel = require('../../models/users')
jest.mock('../../nats-wrapper')
it("returns 401 when supplying a invalid account", async() => {
    return await request(app)
        .post('/api/users/login')
        .send({
            email: "testuser@gmail.com",
            password: "1234aA"
        })
        .expect(401)
})

it("Receives a cookie when logging in successful", async() => {
    await request(app)
        .post('/api/users/signup')
        .send({
            username: "testuser",
            email: "testuser@gmail.com",
            password: "1234aA"
        })
        .expect(201)

    const response = await request(app)
        .post('/api/users/login')
        .send({
            email: "testuser@gmail.com",
            password: "1234aA"
        })
        .expect(200)
    expect(response.get("Set-Cookie")).toBeDefined()
})

it("returns 200 when logging in is successful", async() => {
    await request(app)
        .post('/api/users/signup')
        .send({
            username: "testuser",
            email: "testuser@gmail.com",
            password: "1234aA"
        })
        .expect(201)

    return await request(app)
        .post('/api/users/login')
        .send({
            email: "testuser@gmail.com",
            password: "1234aA"
        })
        .expect(200)
})

it("returns 401 if user supplies invalid email or password", async() => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            username: "testuser",
            email: "testuser@gmail.com",
            password: "1234aA"
        })
        .expect(201)
    
    console.log(response.body.data);

    await request(app)
    .post('/api/users/login')
    .send({
        email: "test@gmail.com",
        password: "1234aA"
    })
    .expect(401)

    await request(app)
    .post('/api/users/login')
    .send({
        email: "testuser@gmail.com",
        password: "1234"
    })
    .expect(401)
})

