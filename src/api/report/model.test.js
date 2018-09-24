import { Report } from '.'
import { User } from '../user'

let user, report

beforeEach(async () => {
  user = await User.create({ email: 'a@a.com', password: '123456' })
  report = await Report.create({ user, userID: 'test', latitude: 'test', longitude: 'test', description: 'test', category: 'test', confirmations: 'test', fixed: 'test', extra: 'test' })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = report.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(report.id)
    expect(typeof view.user).toBe('object')
    expect(view.user.id).toBe(user.id)
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

  it('returns full view', () => {
    const view = report.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(report.id)
    expect(typeof view.user).toBe('object')
    expect(view.user.id).toBe(user.id)
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
