import request from "supertest"
import { apiRoot } from "../../config"
import { signSync } from "../../services/jwt"
import express from "../../services/express"
import { User } from "../user"
import routes, { Report } from "."

const app = () => express(apiRoot, routes)

let userSession, adminSession, report

beforeEach(async () => {
  const user = await User.create({ email: "a@a.com", password: "123456" })
  const admin = await User.create({
    email: "c@c.com",
    password: "123456",
    role: "admin"
  })
  userSession = signSync(user.id)
  adminSession = signSync(admin.id)
  report = await Report.create({
    userID: "admin",
    latitude: 55.2,
    longitude: 22.1,
    description: "Report",
    category: "test",
    confirmations: 1,
    fixed: false,
    extra: "extra"
  })
})

test("POST /reports 201 (user)", async () => {
  const { status, body } = await request(app())
    .post(`${apiRoot}`)
    .send({
      access_token: userSession,
      userID: "admin",
      latitude: 55.2,
      longitude: 22.1,
      description: "Report",
      category: "test",
      confirmations: 1,
      fixed: false,
      extra: "extra"
    })
  expect(status).toBe(201)
  expect(typeof body).toEqual("object")
  expect(body.userID).toEqual(report.userID)
  expect(body.latitude).toEqual(report.latitude)
  expect(body.longitude).toEqual(report.longitude)
  expect(body.description).toEqual(report.description)
  expect(body.category).toEqual(report.category)
  expect(body.confirmations).toEqual(report.confirmations)
  expect(body.fixed).toEqual(report.fixed)
  expect(body.extra).toEqual(report.extra)
})

test("POST /reports 401", async () => {
  const { status } = await request(app()).post(`${apiRoot}`)
  expect(status).toBe(401)
})

test("GET /reports 200 (admin)", async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}`)
    .query({ access_token: adminSession })
  expect(status).toBe(200)
  expect(Array.isArray(body.rows)).toBe(true)
  expect(Number.isNaN(body.count)).toBe(false)
})

test("GET /reports 401 (user)", async () => {
  const { status } = await request(app())
    .get(`${apiRoot}`)
    .query({ access_token: userSession })
  expect(status).toBe(401)
})

test("GET /reports 401", async () => {
  const { status } = await request(app()).get(`${apiRoot}`)
  expect(status).toBe(401)
})

test("GET /reports/:id 200 (admin)", async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${report.id}`)
    .query({ access_token: adminSession })
  expect(status).toBe(200)
  expect(typeof body).toEqual("object")
  expect(body.id).toEqual(report.id)
})

test("GET /reports/:id 401 (user)", async () => {
  const { status } = await request(app())
    .get(`${apiRoot}/${report.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(401)
})

test("GET /reports/:id 401", async () => {
  const { status } = await request(app()).get(`${apiRoot}/${report.id}`)
  expect(status).toBe(401)
})

test("GET /reports/:id 404 (admin)", async () => {
  const { status } = await request(app())
    .get(apiRoot + "/123456789098765432123456")
    .query({ access_token: adminSession })
  expect(status).toBe(404)
})

test("PUT /reports/:id 200 (admin)", async () => {
  const { status, body } = await request(app())
    .put(`${apiRoot}/${report.id}`)
    .send({
      access_token: adminSession,
      userID: "admin",
      latitude: 55.2,
      longitude: 22.1,
      description: "Report",
      category: "test",
      confirmations: 2,
      fixed: true,
      extra: "extra"
    })
  expect(status).toBe(200)
  expect(typeof body).toEqual("object")
  expect(body.userID).toEqual(report.userID)
  expect(body.latitude).toEqual(report.latitude)
  expect(body.longitude).toEqual(report.longitude)
  expect(body.description).toEqual(report.description)
  expect(body.category).toEqual(report.category)
  expect(body.confirmations).toEqual(2)
  expect(body.fixed).toEqual(true)
  expect(body.extra).toEqual(report.extra)
})

test("PUT /reports/:id 401 (user)", async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${report.id}`)
    .send({ access_token: userSession })
  expect(status).toBe(401)
})

test("PUT /reports/:id 401", async () => {
  const { status } = await request(app()).put(`${apiRoot}/${report.id}`)
  expect(status).toBe(401)
})

test("PUT /reports/:id 404 (admin)", async () => {
  const { status } = await request(app())
    .put(apiRoot + "/123456789098765432123456")
    .send({
      access_token: adminSession,
      userID: "admin",
      latitude: 55.2,
      longitude: 22.1,
      description: "Report",
      category: "test",
      confirmations: 2,
      fixed: true,
      extra: "extra"
    })
  expect(status).toBe(404)
})

test("DELETE /reports/:id 204 (admin)", async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${report.id}`)
    .query({ access_token: adminSession })
  expect(status).toBe(204)
})

test("DELETE /reports/:id 401 (user)", async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${report.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(401)
})

test("DELETE /reports/:id 401", async () => {
  const { status } = await request(app()).delete(`${apiRoot}/${report.id}`)
  expect(status).toBe(401)
})

test("DELETE /reports/:id 404 (admin)", async () => {
  const { status } = await request(app())
    .delete(apiRoot + "/123456789098765432123456")
    .query({ access_token: adminSession })
  expect(status).toBe(404)
})
