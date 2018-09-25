import crypto from "crypto"
import { User } from "."

let user

beforeEach(async () => {
  user = await User.create({
    username: "user",
    email: "test@test.com",
    password: "123456"
  })
})

describe("set email", () => {
  it("sets username automatically", () => {
    user.username = ""
    user.email = "test@example.com"
    expect(user.username).toBe("test")
  })
})

describe("view", () => {
  it("returns simple view", () => {
    const view = user.view()
    expect(view).toBeDefined()
    expect(view.id).toBe(user.id)
    expect(view.username).toBe(user.username)
    expect(view.points).toBe(user.points)
  })

  it("returns full view", () => {
    const view = user.view(true)
    expect(view).toBeDefined()
    expect(view.id).toBe(user.id)
    expect(view.username).toBe(user.username)
    expect(view.email).toBe(user.email)
    expect(view.points).toBe(user.points)
    expect(view.createdAt).toEqual(user.createdAt)
    expect(view.role).toEqual(user.role)
  })
})

describe("authenticate", () => {
  it("returns the user when authentication succeed", async () => {
    expect(await user.authenticate("123456")).toBe(user)
  })

  it("returns false when authentication fails", async () => {
    expect(await user.authenticate("blah")).toBe(false)
  })
})
