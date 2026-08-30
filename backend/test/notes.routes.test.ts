import { expect } from 'chai'
import request from 'supertest'
import { app, signedInAgent } from './factories.js'

const SAMPLE_ID = '507f1f77bcf86cd799439011'

interface NoteBody {
  id: string
  title: string
  content: string
  status: string
  isPinned: boolean
  isFavourite: boolean
}

async function createNoteVia(
  agent: Awaited<ReturnType<typeof signedInAgent>>['agent'],
  overrides: { title?: string; content?: string } = {},
): Promise<NoteBody> {
  const response = await agent
    .post('/api/notes')
    .send({
      title: overrides.title ?? 'A note',
      content: overrides.content ?? '<p>Body text</p>',
    })
    .expect(201)

  return response.body.data as NoteBody
}

describe('notes routes require authentication', () => {
  const endpoints = [
    { method: 'get', path: '/api/notes' },
    { method: 'post', path: '/api/notes' },
    { method: 'get', path: `/api/notes/${SAMPLE_ID}` },
    { method: 'put', path: `/api/notes/${SAMPLE_ID}` },
    { method: 'delete', path: `/api/notes/${SAMPLE_ID}` },
    { method: 'patch', path: `/api/notes/${SAMPLE_ID}/status` },
    { method: 'patch', path: `/api/notes/${SAMPLE_ID}/pin` },
    { method: 'patch', path: `/api/notes/${SAMPLE_ID}/favourite` },
  ] as const

  for (const { method, path } of endpoints) {
    it(`${method.toUpperCase()} ${path} returns 401 when signed out`, async () => {
      const response = await request(app)[method](path).send({}).expect(401)
      expect(response.body.success).to.equal(false)
    })
  }
})

describe('POST /api/notes', () => {
  it('creates a note and returns 201', async () => {
    const { agent } = await signedInAgent()
    const note = await createNoteVia(agent, { title: 'Groceries' })

    expect(note.title).to.equal('Groceries')
    expect(note.status).to.equal('active')
  })

  it('never returns contentText', async () => {
    const { agent } = await signedInAgent()
    const note = await createNoteVia(agent)

    expect(note).to.not.have.property('contentText')
  })

  it('rejects a missing title with 400', async () => {
    const { agent } = await signedInAgent()
    const response = await agent.post('/api/notes').send({ content: '<p>Body</p>' }).expect(400)

    expect(response.body.message).to.equal('Title is required.')
  })

  it('rejects a title over 200 characters', async () => {
    const { agent } = await signedInAgent()
    const response = await agent
      .post('/api/notes')
      .send({ title: 'x'.repeat(201), content: '' })
      .expect(400)

    expect(response.body.message).to.equal('Title must be 200 characters or fewer.')
  })
})

describe('GET /api/notes', () => {
  it('lists the signed-in user notes', async () => {
    const { agent } = await signedInAgent()
    await createNoteVia(agent, { title: 'One' })
    await createNoteVia(agent, { title: 'Two' })

    const response = await agent.get('/api/notes').expect(200)
    expect(response.body.data).to.have.length(2)
  })

  it('rejects an unknown status with 400', async () => {
    const { agent } = await signedInAgent()
    const response = await agent.get('/api/notes?status=nonsense').expect(400)

    expect(response.body.message).to.contain('Status must be one of')
  })

  it('falls back to the default sort for an unknown sort value', async () => {
    const { agent } = await signedInAgent()
    await createNoteVia(agent)

    const response = await agent.get('/api/notes?sort=nonsense').expect(200)
    expect(response.body.data).to.have.length(1)
  })

  it('treats favouritesOnly=false as false rather than a truthy string', async () => {
    const { agent } = await signedInAgent()
    await createNoteVia(agent)

    const response = await agent.get('/api/notes?favouritesOnly=false').expect(200)
    expect(response.body.data).to.have.length(1)
  })

  it('filters to favourites when favouritesOnly=true', async () => {
    const { agent } = await signedInAgent()
    await createNoteVia(agent, { title: 'Plain' })
    const favourite = await createNoteVia(agent, { title: 'Starred' })
    await agent.patch(`/api/notes/${favourite.id}/favourite`).send({ isFavourite: true }).expect(200)

    const response = await agent.get('/api/notes?favouritesOnly=true').expect(200)
    expect(response.body.data.map((note: NoteBody) => note.title)).to.deep.equal(['Starred'])
  })
})

describe('GET, PUT and DELETE /api/notes/:id', () => {
  it('reads one note', async () => {
    const { agent } = await signedInAgent()
    const note = await createNoteVia(agent, { title: 'Readable' })

    const response = await agent.get(`/api/notes/${note.id}`).expect(200)
    expect(response.body.data.title).to.equal('Readable')
  })

  it('updates the title and content', async () => {
    const { agent } = await signedInAgent()
    const note = await createNoteVia(agent)

    const response = await agent
      .put(`/api/notes/${note.id}`)
      .send({ title: 'Renamed', content: '<p>New</p>' })
      .expect(200)

    expect(response.body.data.title).to.equal('Renamed')
    expect(response.body.data.content).to.equal('<p>New</p>')
  })

  it('deletes a note', async () => {
    const { agent } = await signedInAgent()
    const note = await createNoteVia(agent)

    await agent.delete(`/api/notes/${note.id}`).expect(200)
    await agent.get(`/api/notes/${note.id}`).expect(404)
  })

  it('returns 404 for a malformed id rather than 500', async () => {
    const { agent } = await signedInAgent()
    const response = await agent.get('/api/notes/not-an-object-id').expect(404)

    expect(response.body.message).to.equal('Note not found.')
  })
})

describe('lifecycle routes', () => {
  it('changes the status', async () => {
    const { agent } = await signedInAgent()
    const note = await createNoteVia(agent)

    const response = await agent
      .patch(`/api/notes/${note.id}/status`)
      .send({ status: 'archived' })
      .expect(200)

    expect(response.body.data.status).to.equal('archived')
  })

  it('rejects an unknown status with 400', async () => {
    const { agent } = await signedInAgent()
    const note = await createNoteVia(agent)

    await agent.patch(`/api/notes/${note.id}/status`).send({ status: 'nonsense' }).expect(400)
  })

  it('pins a note', async () => {
    const { agent } = await signedInAgent()
    const note = await createNoteVia(agent)

    const response = await agent
      .patch(`/api/notes/${note.id}/pin`)
      .send({ isPinned: true })
      .expect(200)

    expect(response.body.data.isPinned).to.equal(true)
  })

  it('rejects a non-boolean pin value with 400', async () => {
    const { agent } = await signedInAgent()
    const note = await createNoteVia(agent)

    await agent.patch(`/api/notes/${note.id}/pin`).send({ isPinned: 'true' }).expect(400)
  })

  it('favourites a note', async () => {
    const { agent } = await signedInAgent()
    const note = await createNoteVia(agent)

    const response = await agent
      .patch(`/api/notes/${note.id}/favourite`)
      .send({ isFavourite: true })
      .expect(200)

    expect(response.body.data.isFavourite).to.equal(true)
  })
})

describe('cross-user isolation', () => {
  it('hides another user notes from the list', async () => {
    const owner = await signedInAgent()
    const stranger = await signedInAgent()
    await createNoteVia(owner.agent, { title: 'Private' })

    const response = await stranger.agent.get('/api/notes').expect(200)
    expect(response.body.data).to.have.length(0)
  })

  it('returns 404 for read, update, delete and every patch by a second user', async () => {
    const owner = await signedInAgent()
    const stranger = await signedInAgent()
    const note = await createNoteVia(owner.agent, { title: 'Private' })

    await stranger.agent.get(`/api/notes/${note.id}`).expect(404)
    await stranger.agent.put(`/api/notes/${note.id}`).send({ title: 'Hijacked' }).expect(404)
    await stranger.agent.delete(`/api/notes/${note.id}`).expect(404)
    await stranger.agent
      .patch(`/api/notes/${note.id}/status`)
      .send({ status: 'trashed' })
      .expect(404)
    await stranger.agent.patch(`/api/notes/${note.id}/pin`).send({ isPinned: true }).expect(404)
    await stranger.agent
      .patch(`/api/notes/${note.id}/favourite`)
      .send({ isFavourite: true })
      .expect(404)

    const untouched = await owner.agent.get(`/api/notes/${note.id}`).expect(200)
    expect(untouched.body.data.title).to.equal('Private')
    expect(untouched.body.data.status).to.equal('active')
  })
})
