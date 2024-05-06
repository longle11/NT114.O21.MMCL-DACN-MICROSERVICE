const request = require('supertest')
const app = require('../../app')
it("returns 200 if a user is authenticated", async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            username: "testuser123",
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

    const response = await request(app)
        .get('/api/users/currentuser')
        .set("Cookie", getCookie.get("Set-Cookie"))
        .expect(200)

    expect(response.body.currentUser.email).toEqual("testuser@gmail.com");
})

it("returns 200 if a user is unauthenticated", async () => {
    const response = await request(app)
        .get('/api/users/currentuser')
        .set("Cookie", null)
        .expect(200)

    expect(response.body.currentUser).toEqual(undefined);
})
