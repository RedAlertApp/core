import { Report } from "."

let report

beforeEach(async () => {
  report = await Report.create({
    userID: "admin",
    latitude: 55.2,
    longitude: 22.1,
    description: "Report",
    category: "test",
    confirmations: 1,
    fixed: false,
    extra: "extra"
  })
})

describe("view", () => {
  it("returns simple view", () => {
    const view = report.view()
    expect(typeof view).toBe("object")
    expect(view.id).toBe(report.id)
    expect(view.userID).toBe(report.userID)
    expect(view.latitude).toBe(report.latitude)
    expect(view.longitude).toBe(report.longitude)
    expect(view.description).toBe(report.description)
    expect(view.category).toBe(report.category)
    expect(view.confirmations).toBe(report.confirmations)
    expect(view.fixed).toBe(report.fixed)
    expect(view.extra).toBe(report.extra)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })

  it("returns full view", () => {
    const view = report.view(true)
    expect(typeof view).toBe("object")
    expect(view.id).toBe(report.id)
    expect(view.userID).toBe(report.userID)
    expect(view.latitude).toBe(report.latitude)
    expect(view.longitude).toBe(report.longitude)
    expect(view.description).toBe(report.description)
    expect(view.category).toBe(report.category)
    expect(view.confirmations).toBe(report.confirmations)
    expect(view.fixed).toBe(report.fixed)
    expect(view.extra).toBe(report.extra)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})
