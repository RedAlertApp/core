import { Report } from "../api/report"
import { tokenSockets } from "../services/passport"

const startRedAlert = io => {
  io.on("connection", socket => {
    console.log("socket connected")

    //const token = "chuj"
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjViYzRiNTY3MWIyNWNjNDI2MGMzN2UzMSIsImlhdCI6MTUzOTYxODI5NH0.E7cD5IXwt0ZIfumfyBKuuqLvDyLofR_DUAaAT-CZoXI"

    tokenSockets(token, user => {
      console.log(user)
    })

    Report.find({ fixed: false }, (err, reports) => {
      if (err) console.error(err)
      socket.emit("reports", reports)
    })

    socket.on("newReport", report => {
      let newReport = new Report({
        userID: report.userID,
        latitude: report.latitude,
        longitude: report.longitude,
        description: report.description,
        category: report.category,
        confirmations: report.confirmations,
        extra: report.extra
      })

      newReport.save((err, report) => {
        if (err) console.error(err)
        Report.find({ fixed: false }, (err, reports) => {
          if (err) console.error(err)
          io.emit("reports", reports)
        })
      })
    })

    socket.on("fixReport", reportID => {
      Report.findOneAndUpdate(
        { _id: reportID },
        { fixed: true },
        (err, result) => {
          if (err) console.error(err)
          Report.find({ fixed: false }, (err, reports) => {
            if (err) console.error(err)
            io.emit("reports", reports)
          })
        }
      )
    })

    socket.on("confirmReport", reportID => {
      Report.findOneAndUpdate(
        { _id: reportID },
        { $inc: { confirmations: 1 } },
        (err, result) => {
          if (err) console.error(err)
          Report.find({ fixed: false }, (err, reports) => {
            if (err) console.error(err)
            io.emit("reports", reports)
          })
        }
      )
    })

    socket.on("disconnect", () => {})
  })

  io.on("error", error => {
    console.log(error)
  })
}

export default startRedAlert
