import mongoose from "mongoose"

const reportSchema = new mongoose.Schema(
  {
    // Disable user field since we don't use authentication yet
    // user: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: "User",
    //   required: true
    // },

    // name of user who created this report
    userID: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      require: true
    },
    longitude: {
      type: Number,
      require: true
    },
    description: {
      type: String,
      require: true
    },
    category: {
      type: String,
      required: true
    },
    confirmations: {
      type: Number,
      required: true,
      default: 1
    },
    fixed: {
      type: Boolean,
      required: true,
      default: false
    },
    extra: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (obj, ret) => {
        delete ret._id
      }
    }
  }
)

reportSchema.methods = {
  view(full) {
    const view = {
      // simple view
      id: this.id,
      // user: this.user.view(full),
      userID: this.userID,
      latitude: this.latitude,
      longitude: this.longitude,
      description: this.description,
      category: this.category,
      confirmations: this.confirmations,
      fixed: this.fixed,
      extra: this.extra,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? { ...view } : view
  }
}

const model = mongoose.model("Report", reportSchema)

export const schema = model.schema
export default model
