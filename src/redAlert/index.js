import { Report } from "../api/report"
import { tokenSockets } from "../services/passport"
import socketioAuth from "socketio-auth"

let ioInstance

const startRedAlert = io => {
  ioInstance = io
  socketioAuth(io, {
    authenticate,
    postAuthenticate,
    timeout: 3000
  })
}

const authenticate = async (socket, data, callback) => {
  tokenSockets(data.token, user => {
    if (user) {
      console.log(`Authenticated socket. User: ${user.username}`)
      callback(null, user)
    } else {
      callback(new Error("Not authorized"))
    }
  })
}

const postAuthenticate = (socket, data) => {
  Report.find({ fixed: false }, (err, reports) => {
    handleError(err)
    socket.emit("reports", reports)
  })

  socket.on("newReport", report => onNewReport(report))

  socket.on("fixReport", reportID => onFixReport(reportID))

  socket.on("confirmReport", reportID => onConfirmReport(reportID))
  socket.on("confirmReport", reportID => onConfirmReport(reportID))
}

const onNewReport = report => {
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
    handleError(err)
    Report.find({ fixed: false }, (err, reports) => {
      handleError(err)
      ioInstance.emit("reports", reports)
    })
  })
}

const onFixReport = reportID => {
  Report.findOneAndUpdate({ _id: reportID }, { fixed: true }, (err, result) => {
    handleError(err)
    Report.find({ fixed: false }, (err, reports) => {
      handleError(err)
      ioInstance.emit("reports", reports)
    })
  })
}

const onConfirmReport = reportID => {
  Report.findOneAndUpdate(
    { _id: reportID },
    { $inc: { confirmations: 1 } },
    (err, result) => {
      handleError(err)
      Report.find({ fixed: false }, (err, reports) => {
        handleError(err)
        ioInstance.emit("reports", reports)
      })
    }
  )
}

const handleError = err => {
  if (err) console.error(err)
}

export default startRedAlert
