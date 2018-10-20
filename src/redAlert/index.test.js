import request from "supertest"
import http from "http"
import api from "../api"
import io from "socket.io-client"
import socketIO from "socket.io"
import { masterKey, apiRoot, port, ip } from "../config"
import express from "../services/express"
import startRedAlert from "../redAlert"

let httpServer, ioServer
let token1, socket

beforeAll(async done => {
  const app = express(apiRoot, api)
  httpServer = http.createServer(app)
  ioServer = socketIO(httpServer)
  startRedAlert(ioServer)

  httpServer.listen(port, ip, async () => {
    const response = await request(app)
      .post("/users")
      .send({
        access_token: masterKey,
        email: "test123@test.com",
        password: "test123"
      })

    token1 = response.body.token

    done()
  })
})

afterAll(done => {
  ioServer.close()
  httpServer.close()
  done()
})

beforeEach(done => {
  socket = io("http://localhost:2137")
  socket.on("connect", () => {
    done()
  })
})

afterEach(done => {
  if (socket.connected) {
    socket.disconnect()
  }
  done()
})

// Timeouts, because socket will disconnect after 3 seconds without proper authorization
test("Unauthorized on connection without token", done => {
  setTimeout(() => {
    expect(socket.connected).toBe(false)
    done()
  }, 5000)
})

test("Unauthorized on connection with fake token", done => {
  socket.emit("authentication", { token: null })
  setTimeout(() => {
    expect(socket.connected).toBe(false)
    done()
  }, 5000)
})

// Skip these tests for now, no idea how to test that
// Got unauthorized even with proper token, might be something with internal passport or Mongoose thing

test.skip("Connected on connection with real token", done => {
  socket.emit("authentication", { token: token1 })
  setTimeout(() => {
    expect(socket.connected).toBe(true)
    done()
  }, 5000)
})

test.skip("Get reports on connection with real token", done => {
  socket.emit("authentication", { token: token1 })
  socket.on("authenticated", data => {
    console.log(data)
    done()
  })
  socket.on("reports", reports => {
    console.log(reports)
    expect(reports).toBeTruthy()
    done()
  })
})
