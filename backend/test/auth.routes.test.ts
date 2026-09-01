import { expect } from 'chai'
import request from 'supertest'
import { app, signedInAgent, uniqueEmail } from './factories.js'

function cookieHeader(response: request.Response): string {
  const header = response.headers['set-cookie']
  return Array.isArray(header) ? header.join('; ') : String(header ?? '')
}

describe('POST /api/auth/register', () => {
  it('creates a user and returns 201 with the public user', async () => {
    const email = uniqueEmail()
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ada Lovelace', email, password: 'password123' })
      .expect(201)

    expect(response.body.success).to.equal(true)
    expect(response.body.data.email).to.equal(email)
    expect(response.body.data).to.not.have.property('passwordHash')
  })

  it('sets an httpOnly SameSite=Lax session cookie', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ada Lovelace', email: uniqueEmail(), password: 'password123' })
      .expect(201)

    const cookie = cookieHeader(response)
    expect(cookie).to.contain('aether_token=')
    expect(cookie).to.contain('HttpOnly')
    expect(cookie).to.contain('SameSite=Lax')
  })

  it('rejects a duplicate email with 409 and the contract string', async () => {
    const email = uniqueEmail()
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ada Lovelace', email, password: 'password123' })
      .expect(201)

    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Someone Else', email, password: 'password123' })
      .expect(409)

    expect(response.body).to.deep.equal({
      success: false,
      message: 'An account with that email already exists.',
    })
  })

  it('rejects a blank name with the frontend message', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: '   ', email: uniqueEmail(), password: 'password123' })
      .expect(400)

    expect(response.body.message).to.equal('Enter your name.')
  })

  it('rejects a name over 60 characters', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'x'.repeat(61), email: uniqueEmail(), password: 'password123' })
      .expect(400)

    expect(response.body.message).to.equal('Keep your name under 60 characters.')
  })

  it('rejects an invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ada Lovelace', email: 'not-an-email', password: 'password123' })
      .expect(400)

    expect(response.body.message).to.equal('Enter a valid email address.')
  })

  it('rejects a password under 8 characters', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ada Lovelace', email: uniqueEmail(), password: 'short' })
      .expect(400)

    expect(response.body.message).to.equal('Use at least 8 characters.')
  })

  it('rejects a password over bcrypt 72-byte limit', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ada Lovelace', email: uniqueEmail(), password: 'A'.repeat(73) })
      .expect(400)

    expect(response.body.message).to.equal('Use at most 72 bytes.')
  })

  it('measures the password limit in bytes, not characters', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ada Lovelace', email: uniqueEmail(), password: `${'x'.repeat(69)}\u{1F512}` })
      .expect(400)

    expect(response.body.message).to.equal('Use at most 72 bytes.')
  })

  it('accepts a password at exactly 72 bytes', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ada Lovelace', email: uniqueEmail(), password: 'A'.repeat(72) })
      .expect(201)
  })
})

describe('POST /api/auth/login', () => {
  it('signs in and sets the cookie', async () => {
    const email = uniqueEmail()
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ada Lovelace', email, password: 'password123' })
      .expect(201)

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'password123' })
      .expect(200)

    expect(cookieHeader(response)).to.contain('aether_token=')
  })

  it('returns an identical 401 for a wrong password and an unknown email', async () => {
    const email = uniqueEmail()
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ada Lovelace', email, password: 'password123' })
      .expect(201)

    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(401)

    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: uniqueEmail(), password: 'password123' })
      .expect(401)

    expect(wrongPassword.body).to.deep.equal(unknownEmail.body)
    expect(wrongPassword.body.message).to.equal('Incorrect email or password.')
  })

  it('rejects a missing password without revealing the reason', async () => {
    const response = await request(app).post('/api/auth/login').send({ email: 'a@b.co' }).expect(401)

    expect(response.body.message).to.equal('Incorrect email or password.')
  })
})

describe('GET /api/auth/me', () => {
  it('returns the signed-in user', async () => {
    const { agent, email } = await signedInAgent()
    const response = await agent.get('/api/auth/me').expect(200)

    expect(response.body.data.email).to.equal(email)
  })

  it('returns 401 without a cookie, which is the designed signed-out probe', async () => {
    const response = await request(app).get('/api/auth/me').expect(401)

    expect(response.body).to.deep.equal({ success: false, message: 'You are not signed in.' })
  })

  it('returns 401 for a tampered cookie', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Cookie', 'aether_token=not-a-real-token')
      .expect(401)

    expect(response.body.message).to.equal('Your session has expired.')
  })

  it('returns 401 for an empty cookie value', async () => {
    await request(app).get('/api/auth/me').set('Cookie', 'aether_token=').expect(401)
  })
})

describe('POST /api/auth/logout', () => {
  it('clears the cookie', async () => {
    const { agent } = await signedInAgent()
    const response = await agent.post('/api/auth/logout').expect(200)

    expect(cookieHeader(response)).to.contain('aether_token=;')
  })

  it('leaves the session unusable afterwards', async () => {
    const { agent } = await signedInAgent()
    await agent.post('/api/auth/logout').expect(200)
    await agent.get('/api/auth/me').expect(401)
  })
})

describe('error middleware', () => {
  it('returns a 404 envelope for an unknown route', async () => {
    const response = await request(app).get('/api/does-not-exist').expect(404)

    expect(response.body.success).to.equal(false)
    expect(response.body.message).to.contain('Cannot GET /api/does-not-exist')
  })

  it('shapes every failure as success false with a message', async () => {
    const response = await request(app).post('/api/auth/login').send({}).expect(401)

    expect(Object.keys(response.body).sort()).to.deep.equal(['message', 'success'])
  })
})

describe('GET /api/health', () => {
  it('reports a connected database', async () => {
    const response = await request(app).get('/api/health').expect(200)

    expect(response.body.success).to.equal(true)
  })
})
