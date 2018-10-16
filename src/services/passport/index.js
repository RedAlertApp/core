import passport from "passport"
import { Schema } from "bodymen"
import { BasicStrategy } from "passport-http"
import { Strategy as BearerStrategy } from "passport-http-bearer"
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt"
import { jwtSecret, masterKey } from "../../config"
import User, { schema } from "../../api/user/model"

export const jwtOptions = {
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromUrlQueryParameter("access_token"),
    ExtractJwt.fromBodyField("access_token"),
    ExtractJwt.fromAuthHeaderWithScheme("Bearer")
  ])
}

export const password = () => (req, res, next) =>
  passport.authenticate("password", { session: false }, (err, user, info) => {
    if (err && err.param) {
      return res.status(400).json(err)
    } else if (err || !user) {
      return res.status(401).end()
    }
    req.logIn(user, { session: false }, err => {
      if (err) return res.status(401).end()
      next()
    })
  })(req, res, next)

export const master = () => passport.authenticate("master", { session: false })

export const token = ({ required, roles = User.roles } = {}) => (
  req,
  res,
  next
) =>
  passport.authenticate("token", { session: false }, (err, user, info) => {
    console.log(user)
    if (
      err ||
      (required && !user) ||
      (required && !~roles.indexOf(user.role))
    ) {
      return res.status(401).end()
    }
    req.logIn(user, { session: false }, err => {
      if (err) return res.status(401).end()
      next()
    })
  })(req, res, next)

// Hacky hacky
export const tokenSockets = (token, callback) =>
  passport.authenticate("token-sockets", {}, (err, user, info) => {
    if (err || !user) {
      callback(null)
    } else {
      callback(user)
    }
  })(token)

passport.use(
  "password",
  new BasicStrategy((email, password, done) => {
    const userSchema = new Schema({
      email: schema.tree.email,
      password: schema.tree.password
    })

    userSchema.validate({ email, password }, err => {
      if (err) done(err)
    })

    User.findOne({ email }).then(user => {
      if (!user) {
        done(true)
        return null
      }
      return user
        .authenticate(password, user.password)
        .then(user => {
          done(null, user)
          return null
        })
        .catch(done)
    })
  })
)

passport.use(
  "master",
  new BearerStrategy((token, done) => {
    if (token === masterKey) {
      done(null, {})
    } else {
      done(null, false)
    }
  })
)

passport.use(
  "token",
  new JwtStrategy(jwtOptions, ({ id }, done) => {
    User.findById(id)
      .then(user => {
        done(null, user)
        return null
      })
      .catch(done)
  })
)

// Hacky hacky
passport.use(
  "token-sockets",
  new JwtStrategy(
    {
      secretOrKey: jwtSecret,
      jwtFromRequest: token => token
    },
    ({ id }, done) => {
      User.findById(id)
        .then(user => {
          done(null, user)
          return null
        })
        .catch(done)
    }
  )
)
