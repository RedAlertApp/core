import http from "http"
import { env, mongo, port, ip, apiRoot } from "./config"
import mongoose from "./services/mongoose"
import express from "./services/express"
import api from "./api"
import socketIO from "socket.io"
import startRedAlert from "./redAlert"

const app = express(apiRoot, api)
const httpServer = http.createServer(app)
const io = socketIO(httpServer)

startRedAlert(io)

mongoose.connect(
  mongo.uri,
  { useNewUrlParser: true }
)
mongoose.Promise = Promise

setImmediate(() => {
  httpServer.listen(port, ip, () => {
    console.log(
      "Express server listening on http://%s:%d, in %s mode",
      ip,
      port,
      env
    )
  })
})

export default app
