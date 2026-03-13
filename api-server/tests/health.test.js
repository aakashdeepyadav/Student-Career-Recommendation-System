const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server');

test('GET /health returns ok', async () => {
  const response = await request(app).get('/health');

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.message, 'SCRS API Server');
});

test('POST /api/assessment/submit-public rejects invalid payload', async () => {
  const response = await request(app)
    .post('/api/assessment/submit-public')
    .send({
      riasec_responses: { r1: 5 },
      skill_responses: { programming: 4 },
      subject_preferences: { stem: 5 }
    });

  assert.equal(response.status, 400);
  assert.ok(typeof response.body.error === 'string');
});
