import passport from "passport"
import graphqlHTTP from "express-graphql"
import RedAlertAppSchema from "../graphql/schema"

export default graphqlHTTP((req, res) => {
  return new Promise((resolve, reject) => {
    const next = (user, info = {}) => {

      resolve({
        schema: RedAlertAppSchema,
        graphiql: process.env.NODE_ENV !== "production", // <- only enable GraphiQL in production
        context: {
          user: user || null
        }
      })
    }

    passport.authenticate("token", { session: false }, (err, user, info) => {
      if (err || !user) {
        return res.status(401).end()
      }
      req.logIn(user, { session: false }, err => {
        if (err) return res.status(401).end()
        next(user)
      })
    })(req, res, next)
  })
})
