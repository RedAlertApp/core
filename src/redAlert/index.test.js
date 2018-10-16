import request from "supertest"
import http from "http"
import api from "../api"
import io from "socket.io-client"
import socketIO from "socket.io"
import { masterKey, apiRoot } from "../config"
import { signSync } from "../services/jwt"
import express from "../services/express"
import routes, { User } from "../api/user"
import startRedAlert from "../redAlert"

let user1, user2, admin, session1, session2, adminSession, client

beforeEach(async () => {
  const app = express(apiRoot, api)
  const httpServer = http.createServer(app)
  const io = socketIO(httpServer)
  startRedAlert(io)

  user1 = await User.create({
    username: "user",
    email: "a@a.com",
    password: "123456"
  })
  user2 = await User.create({
    username: "user",
    email: "b@b.com",
    password: "123456"
  })
  admin = await User.create({
    email: "c@c.com",
    password: "123456",
    role: "admin"
  })
  session1 = signSync(user1.id)
  session2 = signSync(user2.id)
  adminSession = signSync(admin.id)

  // client = io("http://localhost:2137")
})

test("Unauthorized on connection without token", () => {
  let socket = io("http://localhost:2137")

  expect(socket.connected).toBe(false)
})

test("Unauthorized on connection with fake token", () => {
  let socket = io("http://localhost:2137")

  socket.emit("authentication", { token: null })
  socket.on("unauthorized", data => {
    console.log(data)
  })
})
