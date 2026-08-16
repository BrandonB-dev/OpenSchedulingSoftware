import { describe, it, expect, beforeEach } from 'vitest'
import { usePaymentStore } from './usePaymentStore'
import { useAppointmentStore } from './useAppointmentStore'
import { useClientStore } from './useClientStore'
import { useEmployeeStore } from './useEmployeeStore'
import { resetStores } from '../testUtils/resetStores'
import { buildClient, buildAppointment, buildPayment, buildEmployee } from '../testUtils/builders'

describe('usePaymentStore', () => {
  beforeEach(() => resetStores())

  describe('getReceivedPayments', () => {
    it('returns an empty array when no payments have been received', () => {
      expect(usePaymentStore.getState().getReceivedPayments()).toEqual([])
    })

    it('returns only payments with paymentReceived true, joined with client and appointment', () => {
      const client = buildClient({ name: 'Jane Doe' })
      const appointment = buildAppointment({ clientID: client.id })
      const received = buildPayment({ appointmentID: appointment.id, paymentReceived: true })
      const unreceived = buildPayment({ appointmentID: appointment.id, paymentReceived: false })

      useClientStore.setState({ clients: [client] })
      useAppointmentStore.setState({ appointments: [appointment] })
      usePaymentStore.setState({ payments: [received, unreceived] })

      const result = usePaymentStore.getState().getReceivedPayments()

      expect(result).toHaveLength(1)
      expect(result[0].payment.id).toBe(received.id)
      expect(result[0].client.name).toBe('Jane Doe')
    })

    it('sorts received payments by parsed date, descending, across a year boundary', () => {
      const client = buildClient()
      const appointment = buildAppointment({ clientID: client.id })
      const decPayment = buildPayment({
        appointmentID: appointment.id,
        paymentReceived: true,
        date: new Date(2025, 11, 15).toDateString(),
      })
      const janPayment = buildPayment({
        appointmentID: appointment.id,
        paymentReceived: true,
        date: new Date(2026, 0, 10).toDateString(),
      })

      useClientStore.setState({ clients: [client] })
      useAppointmentStore.setState({ appointments: [appointment] })
      usePaymentStore.setState({ payments: [decPayment, janPayment] })

      const result = usePaymentStore.getState().getReceivedPayments()

      expect(result.map((r) => r.payment.id)).toEqual([janPayment.id, decPayment.id])
    })

    it('excludes a received payment whose appointment no longer exists', () => {
      const payment = buildPayment({
        paymentReceived: true,
        appointmentID: 'missing-appointment',
      })
      usePaymentStore.setState({ payments: [payment] })

      expect(usePaymentStore.getState().getReceivedPayments()).toEqual([])
    })

    it('excludes a received payment whose client no longer exists', () => {
      const appointment = buildAppointment({ clientID: 'missing-client' })
      const payment = buildPayment({ appointmentID: appointment.id, paymentReceived: true })

      useAppointmentStore.setState({ appointments: [appointment] })
      usePaymentStore.setState({ payments: [payment] })

      expect(usePaymentStore.getState().getReceivedPayments()).toEqual([])
    })
  })

  describe('getTotalCollected', () => {
    it('returns 0 when there are no received payments', () => {
      expect(usePaymentStore.getState().getTotalCollected()).toBe(0)
    })

    it('sums appointment charge across all received payments, including ones from over a year ago', () => {
      const oldAppointment = buildAppointment({ charge: 100 })
      const recentAppointment = buildAppointment({ charge: 50 })
      const oldPayment = buildPayment({
        appointmentID: oldAppointment.id,
        paymentReceived: true,
        date: new Date(2020, 0, 1).toDateString(),
      })
      const recentPayment = buildPayment({
        appointmentID: recentAppointment.id,
        paymentReceived: true,
      })

      useAppointmentStore.setState({ appointments: [oldAppointment, recentAppointment] })
      usePaymentStore.setState({ payments: [oldPayment, recentPayment] })

      expect(usePaymentStore.getState().getTotalCollected()).toBe(150)
    })
  })

  describe('getTotalNetAfterPayouts', () => {
    it('equals the gross total when none of the received payments have expenses paid out yet', () => {
      const appointment = buildAppointment({ charge: 100, expense: 25 })
      const payment = buildPayment({
        appointmentID: appointment.id,
        paymentReceived: true,
        expensesPaid: false,
      })

      useAppointmentStore.setState({ appointments: [appointment] })
      usePaymentStore.setState({ payments: [payment] })

      const store = usePaymentStore.getState()
      expect(store.getTotalNetAfterPayouts()).toBe(store.getTotalCollected())
    })

    it('is lower than the gross total once a received payment has been paid out', () => {
      const appointment = buildAppointment({ charge: 100, expense: 25 })
      const payment = buildPayment({
        appointmentID: appointment.id,
        paymentReceived: true,
        expensesPaid: true,
      })

      useAppointmentStore.setState({ appointments: [appointment] })
      usePaymentStore.setState({ payments: [payment] })

      const store = usePaymentStore.getState()
      expect(store.getTotalNetAfterPayouts()).toBeLessThan(store.getTotalCollected())
    })

    it('subtracts the exact expense sum across all expensesPaid payments, even one not yet received', () => {
      const apptA = buildAppointment({ charge: 100, expense: 25 })
      const apptB = buildAppointment({ charge: 200, expense: 30 })
      const apptC = buildAppointment({ charge: 300, expense: 40 })

      const paymentA = buildPayment({
        appointmentID: apptA.id,
        paymentReceived: true,
        expensesPaid: true,
      })
      const paymentB = buildPayment({
        appointmentID: apptB.id,
        paymentReceived: true,
        expensesPaid: false,
      })
      const paymentC = buildPayment({
        appointmentID: apptC.id,
        paymentReceived: false,
        expensesPaid: true,
      })

      useAppointmentStore.setState({ appointments: [apptA, apptB, apptC] })
      usePaymentStore.setState({ payments: [paymentA, paymentB, paymentC] })

      const store = usePaymentStore.getState()
      // gross: only A and B are received -> 100 + 200 = 300 (C's charge never counts)
      // paid out: A and C have expensesPaid -> 25 + 40 = 65 (B's expense isn't paid out yet)
      expect(store.getTotalCollected()).toBe(300)
      expect(store.getTotalNetAfterPayouts()).toBe(300 - 65)
    })
  })

  describe('getAmountOwedByEmployee', () => {
    it('returns an empty array when there are no unpaid payments', () => {
      expect(usePaymentStore.getState().getAmountOwedByEmployee()).toEqual([])
    })

    it('attributes the full expense to a single employee on an appointment', () => {
      const employee = buildEmployee({ name: 'Alex' })
      const appointment = buildAppointment({ employeeIDs: [employee.id], expense: 40 })
      const payment = buildPayment({ appointmentID: appointment.id, expensesPaid: false })

      useEmployeeStore.setState({ employees: [employee] })
      useAppointmentStore.setState({ appointments: [appointment] })
      usePaymentStore.setState({ payments: [payment] })

      const result = usePaymentStore.getState().getAmountOwedByEmployee()

      expect(result).toHaveLength(1)
      expect(result[0].employee.id).toBe(employee.id)
      expect(result[0].amount).toBe(40)
    })

    it('splits the expense evenly across multiple employees on an appointment', () => {
      const employeeA = buildEmployee({ name: 'Alex' })
      const employeeB = buildEmployee({ name: 'Bailey' })
      const appointment = buildAppointment({
        employeeIDs: [employeeA.id, employeeB.id],
        expense: 50,
      })
      const payment = buildPayment({ appointmentID: appointment.id, expensesPaid: false })

      useEmployeeStore.setState({ employees: [employeeA, employeeB] })
      useAppointmentStore.setState({ appointments: [appointment] })
      usePaymentStore.setState({ payments: [payment] })

      const result = usePaymentStore.getState().getAmountOwedByEmployee()

      expect(result).toHaveLength(2)
      expect(result.find((r) => r.employee.id === employeeA.id)?.amount).toBe(25)
      expect(result.find((r) => r.employee.id === employeeB.id)?.amount).toBe(25)
    })

    it('excludes an appointment with no employees assigned', () => {
      const appointment = buildAppointment({ employeeIDs: [], expense: 40 })
      const payment = buildPayment({ appointmentID: appointment.id, expensesPaid: false })

      useAppointmentStore.setState({ appointments: [appointment] })
      usePaymentStore.setState({ payments: [payment] })

      expect(usePaymentStore.getState().getAmountOwedByEmployee()).toEqual([])
    })

    it('excludes payments that have already been paid out', () => {
      const employee = buildEmployee()
      const appointment = buildAppointment({ employeeIDs: [employee.id], expense: 40 })
      const payment = buildPayment({ appointmentID: appointment.id, expensesPaid: true })

      useEmployeeStore.setState({ employees: [employee] })
      useAppointmentStore.setState({ appointments: [appointment] })
      usePaymentStore.setState({ payments: [payment] })

      expect(usePaymentStore.getState().getAmountOwedByEmployee()).toEqual([])
    })
  })
})
