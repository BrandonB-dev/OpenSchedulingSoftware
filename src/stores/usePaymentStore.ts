import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Payment } from '../definitions/payments'
import type { Appointment } from '../definitions/appointments'
import type { Client } from '../definitions/client'
import type { Employee } from '../definitions/employee'
import { useAppointmentStore } from './useAppointmentStore'
import { useClientStore } from './useClientStore'
import { useEmployeeStore } from './useEmployeeStore'

type NewPayment = Omit<Payment, 'id'>

interface Collection {
  client: Client
  appointment: Appointment
}

interface ReceivedPayment {
  client: Client
  payment: Payment
}

interface PaymentState {
  payments: Payment[]
  selectedPaymentID: string | null

  setPayments: (payments: Payment[]) => void
  setSelectedPaymentID: (id: string | null) => void

  createPayment: (data: NewPayment) => void
  getPayment: (id: string) => Payment | undefined
  updatePayment: (id: string, patch: Partial<NewPayment>) => void
  deletePayment: (id: string) => void

  getPaymentsOwed: () => Collection[]
  getPaymentsToPayout: () => Collection[]
  getReceivedPayments: () => ReceivedPayment[]
  getTotalMadeThisWeek: () => number
  getTotalMadeThisMonth: () => number
  getTotalOwed: () => number
  getTotalNeededToPayOut: () => number
  getTotalCollected: () => number
  getTotalNetAfterPayouts: () => number
  getAmountOwedByEmployee: () => { employee: Employee; amount: number }[]

  payHelper: (appointmentID: string) => void
}

// --- date helpers ---
function startOfWeek(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay() // 0 = Sunday
  const diff = (day === 0 ? -6 : 1) - day // shift back to Monday
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function totalReceivedSince(
  payments: Payment[],
  appointments: Appointment[],
  since: Date
): number {
  return payments
    .filter((p) => p.paymentReceived && new Date(p.date) >= since)
    .reduce((sum, p) => {
      const appt = appointments.find((a) => a.id === p.appointmentID)
      return sum + (appt?.charge ?? 0)
    }, 0)
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      payments: [],
      selectedPaymentID: null,

      setPayments: (payments) => set({ payments }),
      setSelectedPaymentID: (id) => set({ selectedPaymentID: id }),

      createPayment: (data) =>
        set((state) => ({
          payments: [...state.payments, { ...data, id: crypto.randomUUID() }],
        })),

      getPayment: (id) => get().payments.find((p) => p.id === id),

      updatePayment: (id, patch) =>
        set((state) => ({
          payments: state.payments.map((p) =>
            p.id === id ? { ...p, ...patch } : p
          ),
        })),

      deletePayment: (id) =>
        set((state) => ({
          payments: state.payments.filter((p) => p.id !== id),
          selectedPaymentID:
            state.selectedPaymentID === id ? null : state.selectedPaymentID,
        })),

      getPaymentsOwed: () => {
        const { appointments } = useAppointmentStore.getState()
        const { clients } = useClientStore.getState()

        return get()
          .payments.filter((p) => !p.paymentReceived)
          .map((p) => {
            const appointment = appointments.find(
              (a) => a.id === p.appointmentID
            )
            const client = appointment
              ? clients.find((c) => c.id === appointment.clientID)
              : undefined
            return appointment && client ? { client, appointment } : null
          })
          .filter((c): c is Collection => c !== null)
      },

      getPaymentsToPayout: () => {
        const { appointments } = useAppointmentStore.getState()
        const { clients } = useClientStore.getState()

        return get()
          .payments.filter((p) => !p.expensesPaid)
          .map((p) => {
            const appointment = appointments.find(
              (a) => a.id === p.appointmentID
            )
            const client = appointment
              ? clients.find((c) => c.id === appointment.clientID)
              : undefined
            return appointment && client ? { client, appointment } : null
          })
          .filter((c): c is Collection => c !== null)

      },

      getReceivedPayments: () => {
        const { appointments } = useAppointmentStore.getState()
        const { clients } = useClientStore.getState()

        return get()
          .payments.filter((p) => p.paymentReceived)
          .map((p) => {
            const appointment = appointments.find(
              (a) => a.id === p.appointmentID
            )
            const client = appointment
              ? clients.find((c) => c.id === appointment.clientID)
              : undefined
            return client ? { client, payment: p } : null
          })
          .filter((r): r is ReceivedPayment => r !== null)
          .sort(
            (a, b) => new Date(b.payment.date).getTime() - new Date(a.payment.date).getTime()
          )
      },

      getTotalMadeThisWeek: () => {
        const { appointments } = useAppointmentStore.getState()
        return totalReceivedSince(
          get().payments,
          appointments,
          startOfWeek(new Date())
        )
      },

      getTotalMadeThisMonth: () => {
        const { appointments } = useAppointmentStore.getState()
        return totalReceivedSince(
          get().payments,
          appointments,
          startOfMonth(new Date())
        )
      },

      getTotalOwed: () =>
        get()
          .getPaymentsOwed()
          .reduce((sum, c) => sum + c.appointment.charge, 0),

      getTotalNeededToPayOut: () => {
        const { appointments } = useAppointmentStore.getState()
        return get()
          .payments.filter((p) => !p.expensesPaid)
          .reduce((sum, p) => {
            const appt = appointments.find((a) => a.id === p.appointmentID)
            return sum + (appt?.expense ?? 0)
          }, 0)
      },

      getTotalCollected: () => {
        const { appointments } = useAppointmentStore.getState()
        return totalReceivedSince(get().payments, appointments, new Date(0))
      },

      getTotalNetAfterPayouts: () => {
        const { appointments } = useAppointmentStore.getState()
        const paidOut = get()
          .payments.filter((p) => p.expensesPaid)
          .reduce((sum, p) => {
            const appt = appointments.find((a) => a.id === p.appointmentID)
            return sum + (appt?.expense ?? 0)
          }, 0)
        return get().getTotalCollected() - paidOut
      },

      getAmountOwedByEmployee: () => {
        const { appointments } = useAppointmentStore.getState()
        const { employees } = useEmployeeStore.getState()

        const amountByEmployeeID = new Map<string, number>()

        get()
          .payments.filter((p) => !p.expensesPaid)
          .forEach((p) => {
            const appt = appointments.find((a) => a.id === p.appointmentID)
            if (!appt || appt.employeeIDs.length === 0) return

            const share = appt.expense / appt.employeeIDs.length
            appt.employeeIDs.forEach((employeeID) => {
              amountByEmployeeID.set(
                employeeID,
                (amountByEmployeeID.get(employeeID) ?? 0) + share
              )
            })
          })

        return Array.from(amountByEmployeeID.entries())
          .map(([employeeID, amount]) => {
            const employee = employees.find((e) => e.id === employeeID)
            return employee ? { employee, amount } : null
          })
          .filter((r): r is { employee: Employee; amount: number } => r !== null)
      },

      payHelper: (appointmentID) => {
        set((state) => ({
          payments: state.payments.map((p) =>
            p.appointmentID == appointmentID ? { ...p, expensesPaid: true } : p
          ),
        }));
      }
    }),
    { name: 'payments' }
  )
)