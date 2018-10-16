import { Report } from "../api/report"
import { tokenSockets } from "../services/passport"
import socketioAuth from "socketio-auth"

const startRedAlert = io => {
  socketioAuth(io, {
    authenticate,
    postAuthenticate,
    timeout: 3000
  })
}

const authenticate = async (client, data, callback) => {
  tokenSockets(data.token, user => {
    if (user) {
      callback(null, user)
    } else {
      callback(new Error("Not authorized"))
    }
  })
}

const postAuthenticate = (io, socket) => {
  Report.find({ fixed: false }, (err, reports) => {
    if (err) console.error(err)
    socket.emit("reports", reports)
  })

  socket.on("newReport", report => onNewReport(io, report))

  socket.on("fixReport", reportID => onFixReport(io, reportID))

  socket.on("confirmReport", reportID => onConfirmReport(io, reportID))
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

export default startRedAlert
