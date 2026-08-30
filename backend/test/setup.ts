import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

process.env.NODE_ENV = 'test'
process.env.LOG_LEVEL = 'silent'
process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long'
process.env.JWT_EXPIRES_IN = '7d'

const server = await MongoMemoryServer.create()

process.env.MONGODB_URI = server.getUri()

export const mochaHooks = {
  async beforeAll(): Promise<void> {
    await mongoose.connect(server.getUri())
  },

  async afterEach(): Promise<void> {
    const { collections } = mongoose.connection
    await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})))
  },

  async afterAll(): Promise<void> {
    await mongoose.disconnect()
    await server.stop()
  },
}
