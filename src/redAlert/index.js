import { Report } from "../api/report"
import { tokenSockets } from "../services/passport"
import { success } from "../services/response"

const startRedAlert = io => {
  io.on("connection", socket => {
    socket.auth = false
    socket.on("authenticate", data => {
      // Check the auth data sent by the client
      checkAuthToken(data.token, (err, user) => {
        if (!err && success) {
          console.log("Authenticated socket " + socket.id)
          socket.auth = true
        }
      })
    })

    setTimeout(() => {
      // If the socket didn't authenticate, disconnect it
      if (!socket.auth) {
        console.log("Disconnecting socket " + socket.id)
        socket.disconnect("unauthorized")
      }
    }, 3000) // 3 sec to auth

    if (socket.auth) {
      Report.find({ fixed: false }, (err, reports) => {
        if (err) console.error(err)
        socket.emit("reports", reports)
      })

      socket.on("newReport", report => onNewReport(io, report))

      socket.on("fixReport", reportID => onFixReport(io, reportID))

      socket.on("confirmReport", reportID => onConfirmReport(io, reportID))
    }

    socket.on("disconnect", () => {})
  })

  io.on("error", error => {
    console.log(error)
  })
}

const onNewReport = (io, report) => {
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
}

const onFixReport = (io, reportID) => {
  Report.findOneAndUpdate({ _id: reportID }, { fixed: true }, (err, result) => {
    if (err) console.error(err)
    Report.find({ fixed: false }, (err, reports) => {
      if (err) console.error(err)
      io.emit("reports", reports)
    })
  })
}

const onConfirmReport = (io, reportID) => {
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
}

const checkAuthToken = (token, callback) => {
  tokenSockets(token, user => {
    if (user) {
      callback(null, user)
    } else {
      callback(new Error("Not authorized"), null)
    }
  })
}

export default startRedAlert
