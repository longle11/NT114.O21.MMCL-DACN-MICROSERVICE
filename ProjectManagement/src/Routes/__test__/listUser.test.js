const app = require('../../app')
const request = require('supertest')
const userModel = require('../../models/userModel')
const createUser = async (username) => {
    return await userModel.create({
        username,
        avatar: `https://ui-avatars.com/api/?name=${username}`
    })
}
it('returns 200 if getting successfully list users without keyword', async () => {
    await createUser("longle")
    await createUser("vie duc")
    await createUser("duc nguyen")
    await createUser("trung thanh")
    await createUser("le long")

    const response = await request(app)
        .get("/api/projectmanagement/listuser?keyword=")
        .expect(200)

    expect(response.body.data.length).toEqual(5)
})

it('returns 200 if getting successfully list users with long keyword', async () => {
    await createUser("longle")
    await createUser("vie duc")
    await createUser("duc nguyen")
    await createUser("trung thanh")
    await createUser("le long")

    const response = await request(app)
        .get("/api/projectmanagement/listuser?keyword=long")
        .expect(200)
    expect(response.body.data.length).toEqual(2)
})