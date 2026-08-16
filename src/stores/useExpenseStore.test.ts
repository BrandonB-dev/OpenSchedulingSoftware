import { describe, it, expect, beforeEach } from 'vitest'
import { useExpenseStore } from './useExpenseStore'
import { resetStores } from '../testUtils/resetStores'
import { buildExpense } from '../testUtils/builders'

describe('useExpenseStore', () => {
  beforeEach(() => resetStores())

  it('adds an expense with a generated id on createExpense', () => {
    useExpenseStore.getState().createExpense(buildExpense({ description: 'Mop' }))

    const expenses = useExpenseStore.getState().expenses
    expect(expenses).toHaveLength(1)
    expect(expenses[0].description).toBe('Mop')
    expect(expenses[0].id).toEqual(expect.any(String))
  })

  it('updates an expense on updateExpense', () => {
    const expense = buildExpense({ amount: 10 })
    useExpenseStore.setState({ expenses: [expense] })

    useExpenseStore.getState().updateExpense(expense.id, { amount: 15 })

    expect(useExpenseStore.getState().getExpense(expense.id)?.amount).toBe(15)
  })

  it('removes an expense on deleteExpense', () => {
    const expense = buildExpense()
    useExpenseStore.setState({ expenses: [expense] })

    useExpenseStore.getState().deleteExpense(expense.id)

    expect(useExpenseStore.getState().expenses).toHaveLength(0)
  })

  it('does not leak state between tests', () => {
    expect(useExpenseStore.getState().expenses).toHaveLength(0)
  })

  describe('getExpensesByAppointmentID', () => {
    it('returns only expenses belonging to the given appointment', () => {
      const expenseA = buildExpense({ appointmentID: 'appointment-1' })
      const expenseB = buildExpense({ appointmentID: 'appointment-2' })
      useExpenseStore.setState({ expenses: [expenseA, expenseB] })

      const result = useExpenseStore.getState().getExpensesByAppointmentID('appointment-1')

      expect(result).toEqual([expenseA])
    })

    it('returns an empty array when the appointment has no expenses', () => {
      expect(useExpenseStore.getState().getExpensesByAppointmentID('appointment-1')).toEqual([])
    })
  })

  describe('getTotalExpensesForAppointment', () => {
    it('sums the amount of every expense on the given appointment', () => {
      const expenseA = buildExpense({ appointmentID: 'appointment-1', amount: 20 })
      const expenseB = buildExpense({ appointmentID: 'appointment-1', amount: 30 })
      const expenseC = buildExpense({ appointmentID: 'appointment-2', amount: 100 })
      useExpenseStore.setState({ expenses: [expenseA, expenseB, expenseC] })

      expect(useExpenseStore.getState().getTotalExpensesForAppointment('appointment-1')).toBe(50)
    })

    it('returns 0 when the appointment has no expenses', () => {
      expect(useExpenseStore.getState().getTotalExpensesForAppointment('appointment-1')).toBe(0)
    })
  })
})
