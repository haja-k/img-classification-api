require('dotenv').config({ path: '.env.testing' })
const request = require('supertest')
const appRoot = require('app-root-path')
const app = require(`${appRoot}/src/test/appTest`)
const messenger = require(`${appRoot}/src/helper/messenger`)
const filePath = `${appRoot}/src/config/messages.json`
const { redisClient } = require(`${appRoot}/src/config/redis`)
const legitEmail = process.env.LEGIT_EMAIL
const legitPassword = process.env.LEGIT_PASSWORD

describe('user login test', () => {
  /* eslint-disable */
  let agent
  /* eslint-enable */
  beforeAll(() => {
    agent = request.agent(app)
  })

  afterAll((done) => {
    redisClient.quit(() => {
      done()
    })
  })
  it('POST /auth/login => should return successful login message and user info', () => {
    return request(app)
      .post('/auth/login')
      .send({
        email: legitEmail,
        password: legitPassword
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            success: true,
            message: messenger(filePath, 'authenticationPassed'),
            data: {
              username: 'davidwallace',
              email: 'davidwallace@sains.com.my',
              fullName: 'David Wallace',
              roleID: 1,
              roleName: 'superadmin'
            }
          })
        )
      })
  })
  it('POST /auth/login => should return unsuccessful login message', () => {
    return request(app)
      .post('/auth/login')
      .send({
        email: legitEmail,
        password: ' '
      })
      .expect('Content-Type', /json/)
      .expect(403)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            success: false,
            message: messenger(filePath, 'invalidPassword')
          })
        )
      })
  })
  it('POST /auth/login => should return unsuccessful login message for unknown user', () => {
    return request(app)
      .post('/auth/login')
      .send({
        email: 'davidwallarce@dundermiflin.com',
        password: ' '
      })
      .expect('Content-Type', /json/)
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            success: false,
            message: messenger(filePath, 'userLoginNotFound')
          })
        )
      })
  })
})

describe('user logout test', () => {
  it('POST /auth/logout => should return unsuccessful logout message', () => {
    return request(app)
      .post('/auth/logout')
      .expect('Content-Type', /json/)
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            success: false,
            message: 'Access denied: User is not logged in.'
          })
        )
      })
  })
})
