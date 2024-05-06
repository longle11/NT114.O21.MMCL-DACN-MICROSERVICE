const { MongoMemoryServer } = require("mongodb-memory-server")
const mongoose = require("mongoose")
jest.mock('../nats-wrapper')

let mongo = null
beforeAll(async () => {
    process.env.JWT_KEY = 'test'
    
    mongo = new MongoMemoryServer()
    await mongo.start()

    const mongoUri = await mongo.getUri()

    await mongoose.connect(mongoUri)
})

beforeEach(async () => {
    jest.clearAllMocks()

    const collections = await mongoose.connection.db.collections()

    for(let collection of collections) {
        await collection.deleteMany({})
    }
})

afterAll(async () => {
    await mongo.stop()
    await mongoose.connection.close()
})