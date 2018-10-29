import "./logrocketSetup"

import http from "http"
import socketIO from "socket.io"
import graphqlHTTP from "express-graphql"

import { env, mongo, port, ip, apiRoot } from "./config"
import mongoose from "./services/mongoose"
import express from "./services/express"
import api from "./api"
import startRedAlert from "./redAlert"
import RedAlertAppSchema from "./graphql/schema"

const app = express(apiRoot, api)
const httpServer = http.createServer(app)
const io = socketIO(httpServer)

startRedAlert(io)

app.use(
  "/graphql",
  graphqlHTTP({
    schema: RedAlertAppSchema,
    graphiql: true
  })
)

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
