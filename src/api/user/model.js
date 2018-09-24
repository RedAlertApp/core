import crypto from "crypto"
import bcrypt from "bcrypt"
import mongoose from "mongoose"
import mongooseKeywords from "mongoose-keywords"
import { env } from "../../config"

const roles = ["user", "admin"]

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      match: /^\S+@\S+\.\S+$/,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    username: {
      type: String,
      index: true,
      trim: true
    },
    role: {
      type: String,
      enum: roles,
      default: "user"
    },
    points: {
      type: Number,
      trim: true,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

userSchema.path("email").set(function(email) {
  if (!this.username) {
    this.username = email.replace(/^(.+)@.+$/, "$1")
  }

  return email
})

userSchema.pre("save", function(next) {
  if (!this.isModified("password")) return next()

  /* istanbul ignore next */
  const rounds = env === "test" ? 1 : 9

  bcrypt
    .hash(this.password, rounds)
    .then(hash => {
      this.password = hash
      next()
    })
    .catch(next)
})

userSchema.methods = {
  view(full) {
    let view = {}
    let fields = ["id", "username", "points"]

    if (full) {
      fields = [...fields, "email", "createdAt"]
    }

    fields.forEach(field => {
      view[field] = this[field]
    })

    return view
  },

  authenticate(password) {
    return bcrypt
      .compare(password, this.password)
      .then(valid => (valid ? this : false))
  }
}

userSchema.statics = {
  roles
}

userSchema.plugin(mongooseKeywords, { paths: ["email", "username"] })

const model = mongoose.model("User", userSchema)

export const schema = model.schema
export default model
