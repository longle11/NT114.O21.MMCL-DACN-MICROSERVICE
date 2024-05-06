const request = require('supertest')
const app = require('../../app')
jest.mock('../../nats-wrapper')
it("returns 200 when logging in successful", async() => {
    await request(app)
        .post('/api/users/signup')
        .send({
            username: "testuser",
            email: "testuser@gmail.com",
            password: "1234aA"
        })
        .expect(201)

    const getCookie = await request(app)
        .post('/api/users/login')
        .send({
            email: "testuser@gmail.com",
            password: "1234aA"
        })
        .expect(200)
    
    return await request(app)
        .post('/api/users/logout')
        .set('Cookie', getCookie.get('Set-Cookie'))
        .expect(200)
})
