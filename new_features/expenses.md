# Expenses

Lets the user log arbitrary line-item expenses (e.g. materials) against an
appointment, distinct from the existing `Appointment.expense` field (which is the
employee payout amount, auto-filled from `Client.employeePayment` — do not conflate
the two). See [README.md](README.md) for how this fits with the other three
feature files.

## Phase 0c — Expense type + store only, no UI yet (parallel-safe)

### Step 1: Define the Expense type
**Prompt:** "Create `src/definitions/expense.ts` exporting an `Expense`
interface: `id: string`, `appointmentID: string`, `description: string`,
`amount: number`. Follow the style of `src/definitions/payments.ts`. Note in a
short comment at the top of the file that this is separate from
`Appointment.expense` (the employee payout field) — this type is for arbitrary
job-cost line items like materials. Add a bullet in `src/definitions/CLAUDE.md`."
**Verify:** `npx tsc -b`

### Step 2: Expense store
**Prompt:** "Create `src/stores/useExpenseStore.ts` for `Expense[]`, following
`src/stores/useClientStore.ts`'s CRUD pattern (`setExpenses`, `createExpense`,
`getExpense`, `updateExpense`, `deleteExpense`). Persist key `'expenses'`. Add one
derived selector: `getExpensesByAppointmentID(appointmentID: string): Expense[]`
and `getTotalExpensesForAppointment(appointmentID: string): number` (sum of
`amount`), following the derived-selector naming convention in
`aiNotes/directoryLogic.md` §3. Add a bullet in `src/stores/CLAUDE.md`."
**Depends on:** Step 1
**Verify:** `npx tsc -b`

### Step 3: Tests
**Prompt:** "Write `src/stores/useExpenseStore.test.ts` following
`src/stores/useClientStore.test.ts`'s pattern (add `buildExpense(overrides?)` to
`src/testUtils/builders.ts` first). Cover create/update/delete and both new
selectors, including the zero-expenses case for
`getTotalExpensesForAppointment`."
**Depends on:** Step 2
**Verify:** `npm run test`

## Phase 2A — Expense CRUD UI on an appointment (sequential, after appointmentScopeGrowth.md §2)

Needs `appointmentInfo.tsx` (the appointment detail view) to already show the
richer appointment shape from `appointmentScopeGrowth.md` §2.3 before adding an
expense list to it, so this section is a hard follow-on to that file, not to
`job.md`.

### Step 4: Expense CRUD UI
**Prompt:** "Create a `src/components/expensesList/` feature folder: a
container `expensesList.tsx` that takes an `appointmentID` prop and renders the
appointment's expenses (via `getExpensesByAppointmentID`) plus a running total (via
`getTotalExpensesForAppointment`), `createExpense.tsx` (description + amount
`Input`s in a `Modal`, following `clientsList/createClient.tsx`'s form pattern),
`updateExpense.tsx`, `deleteExpense.tsx`. Mount `<ExpensesList
appointmentID={appointment.id} />` inside
`src/components/appointmentsList/appointmentInfo.tsx`, below the existing
charge/expense summary."
**Depends on:** Step 3, `appointmentScopeGrowth.md` §2
**Verify:** `npx tsc -b`, manually add/edit/remove an expense on an appointment and confirm the running total updates

### Step 5: Tests
**Prompt:** "Write `src/components/expensesList/createExpense.test.tsx` as a form
test — empty description or non-numeric amount shows an inline error and doesn't
call `createExpense`; a valid submit does — following the pattern established by
`employees.md`'s `createEmployee.test.tsx` (link to it once that file exists) or
the general pattern in `aiNotes/testing.md` §2."
**Depends on:** Step 4
**Verify:** `npm run test`

## Note: the job-level financial rollup (expenses + employee payouts + paid status
per job) lives in [job.md](job.md) Phase 2, not here — it's a read-only aggregation
over `Expense`, `Employee`, and `Payment` scoped to a job's appointments, and
belongs with the Job detail page. This file only owns the `Expense` entity and its
per-appointment CRUD.
