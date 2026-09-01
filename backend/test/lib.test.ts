import { expect } from 'chai'
import { AppError } from '../src/lib/AppError.js'
import { toPlainText } from '../src/lib/html.js'
import { signToken, verifyToken } from '../src/lib/jwt.js'
import { requireBoolean, requireOneOf, requireString, optionalString } from '../src/lib/validate.js'

const OBJECT_ID = '507f1f77bcf86cd799439011'
const TITLE_RULES = { label: 'Title', max: 200 }

describe('toPlainText', () => {
  it('separates block elements so words do not run together', () => {
    expect(toPlainText('<p>one</p><p>two</p>')).to.equal('one two')
  })

  it('separates list items', () => {
    expect(toPlainText('<ul><li>one</li><li>two</li></ul>')).to.equal('one two')
  })

  it('treats a line break as a separator', () => {
    expect(toPlainText('<p>one<br>two</p>')).to.equal('one two')
  })

  it('removes script contents rather than merely untagging them', () => {
    expect(toPlainText('<p>hi</p><script>alert(1)</script>')).to.equal('hi')
  })

  it('removes style contents', () => {
    expect(toPlainText('<style>.a{color:red}</style><p>hi</p>')).to.equal('hi')
  })

  it('removes comments', () => {
    expect(toPlainText('<p>hi</p><!-- hidden -->')).to.equal('hi')
  })

  it('decodes the supported entities', () => {
    expect(toPlainText('<p>a &amp; b &lt; c &gt; d &quot;e&quot; &#39;f&#39;</p>')).to.equal(
      'a & b < c > d "e" \'f\'',
    )
  })

  it('does not mangle a tag whose attribute contains a closing bracket', () => {
    expect(toPlainText('<a title="a > b">link</a>')).to.equal('link')
  })

  it('collapses runs of whitespace', () => {
    expect(toPlainText('<p>a    b</p>')).to.equal('a b')
  })

  it('returns an empty string for empty content', () => {
    expect(toPlainText('')).to.equal('')
  })
})

describe('requireString', () => {
  it('returns the value when present', () => {
    expect(requireString({ title: 'Hello' }, 'title', TITLE_RULES)).to.equal('Hello')
  })

  it('rejects a missing field with the label', () => {
    expect(() => requireString({}, 'title', TITLE_RULES)).to.throw(AppError, 'Title is required.')
  })

  it('rejects a non-string with the label', () => {
    expect(() => requireString({ title: 5 }, 'title', TITLE_RULES)).to.throw(
      AppError,
      'Title is required.',
    )
  })

  it('rejects a value over the maximum', () => {
    expect(() => requireString({ title: 'x'.repeat(201) }, 'title', TITLE_RULES)).to.throw(
      AppError,
      'Title must be 200 characters or fewer.',
    )
  })

  it('accepts a value at exactly the maximum', () => {
    expect(requireString({ title: 'x'.repeat(200) }, 'title', TITLE_RULES)).to.have.length(200)
  })

  it('rejects a null body', () => {
    expect(() => requireString(null, 'title', TITLE_RULES)).to.throw(AppError)
  })

  it('throws with a 400 status', () => {
    try {
      requireString({}, 'title', TITLE_RULES)
      expect.fail('Expected requireString to throw.')
    } catch (error) {
      expect((error as AppError).status).to.equal(400)
    }
  })
})

describe('optionalString', () => {
  it('returns undefined when the field is absent', () => {
    expect(optionalString({}, 'title', TITLE_RULES)).to.equal(undefined)
  })

  it('validates the field when it is present', () => {
    expect(() => optionalString({ title: 5 }, 'title', TITLE_RULES)).to.throw(AppError)
  })
})

describe('requireBoolean', () => {
  it('returns the value when it is a boolean', () => {
    expect(requireBoolean({ isPinned: true }, 'isPinned', 'Pinned')).to.equal(true)
  })

  it('rejects the string "true" rather than coercing it', () => {
    expect(() => requireBoolean({ isPinned: 'true' }, 'isPinned', 'Pinned')).to.throw(
      AppError,
      'Pinned must be true or false.',
    )
  })
})

describe('requireOneOf', () => {
  it('returns the value when it is allowed', () => {
    expect(requireOneOf({ status: 'archived' }, 'status', ['active', 'archived'], 'Status')).to.equal(
      'archived',
    )
  })

  it('lists the allowed values when the value is not one of them', () => {
    expect(() =>
      requireOneOf({ status: 'nope' }, 'status', ['active', 'archived'], 'Status'),
    ).to.throw(AppError, 'Status must be one of: active, archived.')
  })
})

describe('jwt', () => {
  it('round-trips a user id', () => {
    expect(verifyToken(signToken(OBJECT_ID))).to.equal(OBJECT_ID)
  })

  it('rejects a tampered token as an expired session', () => {
    expect(() => verifyToken(`${signToken(OBJECT_ID)}x`)).to.throw(
      AppError,
      'Your session has expired.',
    )
  })

  it('rejects a value that is not a token at all', () => {
    expect(() => verifyToken('not.a.token')).to.throw(AppError, 'Your session has expired.')
  })

  it('rejects with a 401 status', () => {
    try {
      verifyToken('not.a.token')
      expect.fail('Expected verifyToken to throw.')
    } catch (error) {
      expect((error as AppError).status).to.equal(401)
    }
  })
})

describe('AppError', () => {
  it('carries its status and is marked operational', () => {
    const error = new AppError('Nope.', 418)
    expect(error.status).to.equal(418)
    expect(error.isOperational).to.equal(true)
    expect(error.name).to.equal('AppError')
    expect(error).to.be.instanceOf(Error)
  })
})
