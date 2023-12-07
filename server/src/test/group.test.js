/* eslint-disable */
require('dotenv').config({ path: '.env.testing' })
const request = require('supertest')
const appRoot = require('app-root-path')
const app = require(`${appRoot}/src/test/appTest`)
const messenger = require(`${appRoot}/src/helper/messenger`)
const filePath = `${appRoot}/src/config/messages.json`
const { redisClient } = require(`${appRoot}/src/config/redis`)
const legitEmail = process.env.LEGIT_EMAIL
const legitPassword = process.env.LEGIT_PASSWORD

describe('group management', () => {
  beforeAll(() => {
    agent = request.agent(app)
  })

  afterAll((done) => {
    redisClient.quit(() => {
      done()
    })
  })

  let sessionCookie

  it('POST /auth/login => should log in user and store session cookie', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: legitEmail,
        password: legitPassword
      })

    sessionCookie = response.headers['set-cookie']
  })
})
