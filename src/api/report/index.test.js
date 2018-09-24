import request from 'supertest'
import { apiRoot } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import { User } from '../user'
import routes, { Report } from '.'

const app = () => express(apiRoot, routes)

let userSession, adminSession, report

beforeEach(async () => {
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  const admin = await User.create({ email: 'c@c.com', password: '123456', role: 'admin' })
  userSession = signSync(user.id)
  adminSession = signSync(admin.id)
  report = await Report.create({ user })
})

test('POST /reports 201 (user)', async () => {
  const { status, body } = await request(app())
    .post(`${apiRoot}`)
    .send({ access_token: userSession, userID: 'test', latitude: 'test', longitude: 'test', description: 'test', category: 'test', confirmations: 'test', fixed: 'test', extra: 'test' })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body.userID).toEqual('test')
  expect(body.latitude).toEqual('test')
  expect(body.longitude).toEqual('test')
  expect(body.description).toEqual('test')
  expect(body.category).toEqual('test')
  expect(body.confirmations).toEqual('test')
  expect(body.fixed).toEqual('test')
  expect(body.extra).toEqual('test')
  expect(typeof body.user).toEqual('object')
})

test('POST /reports 401', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}`)
  expect(status).toBe(401)
})

test('GET /reports 200 (admin)', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}`)
    .query({ access_token: adminSession })
  expect(status).toBe(200)
  expect(Array.isArray(body.rows)).toBe(true)
  expect(Number.isNaN(body.count)).toBe(false)
})

test('GET /reports 401 (user)', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}`)
    .query({ access_token: userSession })
  expect(status).toBe(401)
})

test('GET /reports 401', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}`)
  expect(status).toBe(401)
})

test('GET /reports/:id 200 (admin)', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${report.id}`)
    .query({ access_token: adminSession })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(report.id)
})

test('GET /reports/:id 401 (user)', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}/${report.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(401)
})

test('GET /reports/:id 401', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}/${report.id}`)
  expect(status).toBe(401)
})

test('GET /reports/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .get(apiRoot + '/123456789098765432123456')
    .query({ access_token: adminSession })
  expect(status).toBe(404)
})

test('PUT /reports/:id 200 (admin)', async () => {
  const { status, body } = await request(app())
    .put(`${apiRoot}/${report.id}`)
    .send({ access_token: adminSession, userID: 'test', latitude: 'test', longitude: 'test', description: 'test', category: 'test', confirmations: 'test', fixed: 'test', extra: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(report.id)
  expect(body.userID).toEqual('test')
  expect(body.latitude).toEqual('test')
  expect(body.longitude).toEqual('test')
  expect(body.description).toEqual('test')
  expect(body.category).toEqual('test')
  expect(body.confirmations).toEqual('test')
  expect(body.fixed).toEqual('test')
  expect(body.extra).toEqual('test')
})

test('PUT /reports/:id 401 (user)', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${report.id}`)
    .send({ access_token: userSession })
  expect(status).toBe(401)
})

test('PUT /reports/:id 401', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${report.id}`)
  expect(status).toBe(401)
})

test('PUT /reports/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .put(apiRoot + '/123456789098765432123456')
    .send({ access_token: adminSession, userID: 'test', latitude: 'test', longitude: 'test', description: 'test', category: 'test', confirmations: 'test', fixed: 'test', extra: 'test' })
  expect(status).toBe(404)
})

test('DELETE /reports/:id 204 (admin)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${report.id}`)
    .query({ access_token: adminSession })
  expect(status).toBe(204)
})

test('DELETE /reports/:id 401 (user)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${report.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(401)
})

test('DELETE /reports/:id 401', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${report.id}`)
  expect(status).toBe(401)
})

test('DELETE /reports/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .delete(apiRoot + '/123456789098765432123456')
    .query({ access_token: adminSession })
  expect(status).toBe(404)
})
