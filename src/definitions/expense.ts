// Separate from Appointment.expense (the employee payout field, auto-filled from
// Client.employeePayment). This type is for arbitrary job-cost line items like
// materials, logged against an appointment.
export interface Expense {
  id: string
  appointmentID: string
  description: string
  amount: number
}
