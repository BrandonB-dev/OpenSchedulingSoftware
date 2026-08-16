import { useMemo } from "react"
import { useExpenseStore } from "../../stores/useExpenseStore"
import CreateExpense from "./createExpense"
import UpdateExpense from "./updateExpense"
import DeleteExpense from "./deleteExpense"

interface ExpensesListProps {
  appointmentID: string
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n)

export default function ExpensesList({ appointmentID }: ExpensesListProps) {
  const expensesState = useExpenseStore((s) => s.expenses)

  const expenses = useMemo(
    () => useExpenseStore.getState().getExpensesByAppointmentID(appointmentID),
    [expensesState, appointmentID]
  )
  const total = useMemo(
    () => useExpenseStore.getState().getTotalExpensesForAppointment(appointmentID),
    [expensesState, appointmentID]
  )

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold tracking-wider text-primary uppercase">Expenses</span>
        <CreateExpense appointmentID={appointmentID} />
      </div>

      {expenses.length === 0 ? (
        <p className="m-0 text-sm text-muted-foreground">No expenses yet.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
          {expenses.map((expense) => (
            <li
              key={expense.id}
              className="flex items-center justify-between gap-2.5 rounded-lg border border-border bg-primary/5 py-2 pr-2 pl-3"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-px">
                <span className="truncate text-sm break-words text-foreground">{expense.description}</span>
                <span className="text-sm font-bold text-primary">{formatCurrency(expense.amount)}</span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <UpdateExpense expense={expense} />
                <DeleteExpense expenseID={expense.id} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-1 flex items-center justify-between rounded-[10px] border border-border bg-primary/5 px-3.5 py-3">
        <span className="text-[10px] font-bold tracking-wider text-primary uppercase">Total Expenses</span>
        <span className="text-base font-bold text-foreground">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
