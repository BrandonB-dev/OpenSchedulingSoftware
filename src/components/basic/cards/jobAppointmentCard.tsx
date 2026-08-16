import { useMemo } from "react"
import type { Appointment } from "../../../definitions/appointments"
import { useEmployeeStore } from "../../../stores/useEmployeeStore"
import { useExpenseStore } from "../../../stores/useExpenseStore"
import { usePaymentStore } from "../../../stores/usePaymentStore"
import { fromDateKey } from "../../../lib/date"
import { Card } from "../../ui/card"
import { cn } from "../../../lib/utils"

interface JobAppointmentCardProps {
  appointment: Appointment
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)

export default function JobAppointmentCard({ appointment }: JobAppointmentCardProps) {
  const employees = useEmployeeStore((s) => s.employees)
  const expensesState = useExpenseStore((s) => s.expenses)
  const paymentsState = usePaymentStore((s) => s.payments)

  const expenses = useMemo(
    () => useExpenseStore.getState().getExpensesByAppointmentID(appointment.id),
    [expensesState, appointment.id]
  )
  const payment = useMemo(
    () => paymentsState.find((p) => p.appointmentID === appointment.id),
    [paymentsState, appointment.id]
  )

  const assignedEmployees = employees.filter((e) => appointment.employeeIDs.includes(e.id))
  const materialTotal = expenses.reduce((sum, e) => sum + e.amount, 0)

  const dateObj = fromDateKey(appointment.date)
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Card className="gap-2.5 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-medium">{appointment.name || formattedDate}</h4>
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium",
              payment?.paymentReceived ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}
          >
            {payment?.paymentReceived ? "Paid" : "Unpaid"}
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium",
              payment?.expensesPaid ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}
          >
            {payment?.expensesPaid ? "Payout Sent" : "Payout Pending"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>Charge: {formatCurrency(appointment.charge)}</span>
        <span>Payout: {formatCurrency(appointment.expense)}</span>
        <span>Materials: {formatCurrency(materialTotal)}</span>
      </div>

      {assignedEmployees.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {assignedEmployees.map((employee) => (
            <span
              key={employee.id}
              className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {employee.name}
            </span>
          ))}
        </div>
      )}

      {expenses.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-1 border-t border-border p-0 pt-2">
          {expenses.map((expense) => (
            <li key={expense.id} className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="truncate">{expense.description}</span>
              <span className="shrink-0">{formatCurrency(expense.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
