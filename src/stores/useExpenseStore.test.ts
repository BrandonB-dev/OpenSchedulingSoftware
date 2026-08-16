import { describe, it, expect, beforeEach } from 'vitest'
import { useExpenseStore } from './useExpenseStore'
import { resetStores } from '../testUtils/resetStores'
import { buildExpense } from '../testUtils/builders'

describe('useExpenseStore', () => {
  beforeEach(() => resetStores())

  it('adds an expense with a generated id on createExpense', () => {
    useExpenseStore.getState().createExpense(buildExpense({ description: 'Paint' }))

    const expenses = useExpenseStore.getState().expenses
    expect(expenses).toHaveLength(1)
    expect(expenses[0].description).toBe('Paint')
    expect(expenses[0].id).toEqual(expect.any(String))
  })

  it('updates an expense on updateExpense', () => {
    const expense = buildExpense({ amount: 50 })
    useExpenseStore.setState({ expenses: [expense] })

    useExpenseStore.getState().updateExpense(expense.id, { amount: 75 })

    expect(useExpenseStore.getState().getExpense(expense.id)?.amount).toBe(75)
  })

  it('removes an expense on deleteExpense', () => {
    const expense = buildExpense()
    useExpenseStore.setState({ expenses: [expense] })

    useExpenseStore.getState().deleteExpense(expense.id)

    expect(useExpenseStore.getState().expenses).toHaveLength(0)
  })

  it('getExpensesByAppointmentID returns only expenses for that appointment', () => {
    const expenseA1 = buildExpense({ appointmentID: 'appt-1' })
    const expenseA2 = buildExpense({ appointmentID: 'appt-1' })
    const expenseB = buildExpense({ appointmentID: 'appt-2' })
    useExpenseStore.setState({ expenses: [expenseA1, expenseA2, expenseB] })

    const result = useExpenseStore.getState().getExpensesByAppointmentID('appt-1')

    expect(result).toEqual([expenseA1, expenseA2])
  })

  it('getTotalExpensesForAppointment sums amounts for that appointment', () => {
    useExpenseStore.setState({
      expenses: [
        buildExpense({ appointmentID: 'appt-1', amount: 30 }),
        buildExpense({ appointmentID: 'appt-1', amount: 20 }),
        buildExpense({ appointmentID: 'appt-2', amount: 100 }),
      ],
    })

    expect(useExpenseStore.getState().getTotalExpensesForAppointment('appt-1')).toBe(50)
  })

  it('getTotalExpensesForAppointment returns 0 when there are no expenses', () => {
    expect(useExpenseStore.getState().getTotalExpensesForAppointment('appt-1')).toBe(0)
  })

  it('does not leak state between tests', () => {
    expect(useExpenseStore.getState().expenses).toHaveLength(0)
  })
})
