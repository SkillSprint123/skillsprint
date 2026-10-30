import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  changeAccountPlan,
  createAccount,
  editAccount,
  enterAccount,
  parseStoredAccount,
} from '../../src/app/auth/storage'
import { plans, getPlan } from '../../src/app/plans/catalog'
import { planIdSchema, plansSchema } from '../../src/app/plans/schemas'

test('existing local accounts receive the free plan without losing profile or login', () => {
  const account = enterAccount(createAccount(), { displayName: 'Мария' })
  const legacy = { ...account, plan: undefined }
  const restored = parseStoredAccount(JSON.stringify(legacy))
  assert.equal(restored?.plan, 'free')
  assert.equal(restored?.signedIn, true)
  assert.deepEqual(restored?.profile, account.profile)
})

test('demo plan changes preserve profile, persist, and survive profile editing and logout', () => {
  const initial = enterAccount(createAccount(), {})
  for (const plan of planIdSchema.options) {
    const selected = changeAccountPlan(initial, plan)
    assert.equal(selected.plan, plan)
    assert.equal(selected.signedIn, true)
    assert.deepEqual(selected.profile, initial.profile)
    const updated = editAccount(selected, {
      ...initial.profile,
      displayName: 'Новое имя',
    })
    const restored = parseStoredAccount(
      JSON.stringify({ ...updated, signedIn: false }),
    )
    assert.equal(restored?.plan, plan)
    assert.equal(enterAccount(restored!, {}).plan, plan)
  }
})

test('the catalog contains three unique valid plans with a free option and rejects invalid offers', () => {
  assert.equal(getPlan('free').price, 0)
  assert.ok(getPlan('ultimate').price > getPlan('pro').price)
  assert.ok(getPlan('pro').price > 0)
  assert.equal(plansSchema.safeParse(plans).success, true)
  assert.equal(
    plansSchema.safeParse([plans[0], plans[0], plans[2]]).success,
    false,
  )
  assert.equal(
    plansSchema.safeParse([plans[0], { ...plans[1], price: -1 }, plans[2]])
      .success,
    false,
  )
  assert.equal(planIdSchema.safeParse('unknown').success, false)
})
