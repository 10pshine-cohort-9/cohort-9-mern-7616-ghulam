import { expect } from 'chai'
import { getUserById, login, register, toPublicUser } from '../src/services/auth.service.js'
import { User } from '../src/models/User.js'
import { makeUser, rejects, uniqueEmail } from './factories.js'

describe('register', () => {
  it('returns exactly the four public fields', async () => {
    const user = await register('Ada Lovelace', uniqueEmail(), 'password123')
    expect(Object.keys(user).sort()).to.deep.equal(['createdAt', 'email', 'id', 'name'])
  })

  it('never returns the password hash', async () => {
    const user = await register('Ada Lovelace', uniqueEmail(), 'password123')
    expect(user).to.not.have.property('passwordHash')
  })

  it('returns the id as a hex string and createdAt as an ISO string', async () => {
    const user = await register('Ada Lovelace', uniqueEmail(), 'password123')
    expect(user.id).to.match(/^[0-9a-f]{24}$/)
    expect(new Date(user.createdAt).toISOString()).to.equal(user.createdAt)
  })

  it('stores a bcrypt hash rather than the password', async () => {
    const email = uniqueEmail()
    await register('Ada Lovelace', email, 'password123')

    const stored = await User.findOne({ email }).select('+passwordHash')
    expect(stored?.passwordHash).to.be.a('string')
    expect(stored?.passwordHash).to.not.equal('password123')
    expect(stored?.passwordHash.startsWith('$2')).to.equal(true)
  })

  it('lowercases and trims the email', async () => {
    const user = await register('Ada Lovelace', '  MiXeD@Example.COM  ', 'password123')
    expect(user.email).to.equal('mixed@example.com')
  })

  it('trims the name', async () => {
    const user = await register('  Ada Lovelace  ', uniqueEmail(), 'password123')
    expect(user.name).to.equal('Ada Lovelace')
  })

  it('rejects a duplicate email with the exact contract string and a 409', async () => {
    const email = uniqueEmail()
    await register('Ada Lovelace', email, 'password123')

    const error = await rejects(register('Someone Else', email, 'password123'))
    expect(error.message).to.equal('An account with that email already exists.')
    expect(error.status).to.equal(409)
  })

  it('treats a differently cased duplicate as a duplicate', async () => {
    const email = uniqueEmail()
    await register('Ada Lovelace', email, 'password123')

    const error = await rejects(register('Someone Else', email.toUpperCase(), 'password123'))
    expect(error.status).to.equal(409)
  })
})

describe('login', () => {
  it('signs in with correct credentials', async () => {
    const user = await makeUser()
    const signedIn = await login(user.email, user.password)
    expect(signedIn.id).to.equal(user.id)
  })

  it('accepts a differently cased email', async () => {
    const user = await makeUser()
    const signedIn = await login(user.email.toUpperCase(), user.password)
    expect(signedIn.id).to.equal(user.id)
  })

  it('rejects an unknown email and a wrong password identically', async () => {
    const user = await makeUser()

    const unknown = await rejects(login(uniqueEmail(), 'password123'))
    const wrongPassword = await rejects(login(user.email, 'a-different-password'))

    expect(unknown.message).to.equal(wrongPassword.message)
    expect(unknown.status).to.equal(wrongPassword.status)
    expect(unknown.message).to.equal('Incorrect email or password.')
    expect(unknown.status).to.equal(401)
  })

  it('never returns the password hash', async () => {
    const user = await makeUser()
    const signedIn = await login(user.email, user.password)
    expect(signedIn).to.not.have.property('passwordHash')
  })
})

describe('getUserById', () => {
  it('returns the public user', async () => {
    const user = await makeUser()
    const found = await getUserById(user.id)
    expect(found.email).to.equal(user.email)
  })

  it('rejects an unknown id with a 401', async () => {
    const error = await rejects(getUserById('507f1f77bcf86cd799439011'))
    expect(error.message).to.equal('You are not signed in.')
    expect(error.status).to.equal(401)
  })
})

describe('toPublicUser', () => {
  it('is the only exit path and strips everything else', async () => {
    const email = uniqueEmail()
    await register('Ada Lovelace', email, 'password123')

    const stored = await User.findOne({ email }).select('+passwordHash')
    if (stored === null) {
      expect.fail('Expected the user to be stored.')
    }

    expect(Object.keys(toPublicUser(stored)).sort()).to.deep.equal([
      'createdAt',
      'email',
      'id',
      'name',
    ])
  })
})
