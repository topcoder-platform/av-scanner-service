/**
 * The tests for ClamAV Scan API.
 */
process.env.NODE_ENV = 'test'

const assert = require('assert')
const supertest = require('supertest')
const app = require('../index')

const request = supertest(app)

describe('POST /scan', () => {
  it('should scan file successfully', () =>
    request.post('/scan')
      .attach('file', 'test/files/good_submission.zip')
      .expect(200)
      .then((res) => {
        assert.equal(res.body.infected, false)
        assert.equal(res.body.malicious, undefined)
      })
  )

  it('should scan EICAR test file successfully', () =>
    request.post('/scan')
      .attach('file', 'test/files/EICAR_submission.zip')
      .expect(200)
      .then((res) => {
        assert.equal(res.body.infected, true)
        assert.equal(res.body.malicious, 'Eicar-Test-Signature')
      })
  )

  it('should return 400 for missing file', () =>
    request.post('/scan')
      .expect(400)
      .then((res) => {
        assert.ok(res.body.message)
      })
  )

  it('should return 400 for invalid field name', () =>
    request.post('/scan')
      .attach('invalid', 'test/files/good_submission.zip')
      .expect(400)
      .then((res) => {
        assert.ok(res.body.message)
      })
  )
})

describe('GET /health', () => {
  it('should indicate the ClamAV daemon to be active', (done) => {
    request.get('/health')
      .expect(200, done)
  })
})
