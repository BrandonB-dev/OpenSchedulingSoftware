// Separate from Appointment.expense (the employee payout field, auto-filled
// from Client.employeePayment) — this type is for arbitrary job-cost line
// items like materials.
export interface Expense {
  id: string
  appointmentID: string
  description: string
  amount: number
}
