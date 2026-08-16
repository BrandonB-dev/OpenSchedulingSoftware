import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Expense } from '../definitions/expense'

type NewExpense = Omit<Expense, 'id'>

interface ExpenseState {
  expenses: Expense[]

  setExpenses: (expenses: Expense[]) => void

  createExpense: (data: NewExpense) => void
  getExpense: (id: string) => Expense | undefined
  updateExpense: (id: string, patch: Partial<NewExpense>) => void
  deleteExpense: (id: string) => void

  getExpensesByAppointmentID: (appointmentID: string) => Expense[]
  getTotalExpensesForAppointment: (appointmentID: string) => number
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: [],

      setExpenses: (expenses) => set({ expenses }),

      createExpense: (data) =>
        set((state) => ({
          expenses: [...state.expenses, { ...data, id: crypto.randomUUID() }],
        })),

      getExpense: (id) => get().expenses.find((e) => e.id === id),

      updateExpense: (id, patch) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...patch } : e
          ),
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      getExpensesByAppointmentID: (appointmentID) =>
        get().expenses.filter((e) => e.appointmentID === appointmentID),

      getTotalExpensesForAppointment: (appointmentID) =>
        get()
          .expenses.filter((e) => e.appointmentID === appointmentID)
          .reduce((sum, e) => sum + e.amount, 0),
    }),
    { name: 'expenses' }
  )
)
