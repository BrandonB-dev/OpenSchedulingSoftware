# src/stores

Zustand stores — the app's single source of truth for domain data. Each store wraps a `create<...>()(persist(...))` pattern that auto-persists its state to `localStorage` (via zustand's `persist` middleware), so these stores double as the "database" layer described in [src/lib](../lib/CLAUDE.md) (`exportData`/`importData` read/write the same `localStorage` keys) and [src/hooks/useClient.ts](../hooks/CLAUDE.md).

All three stores follow the same CRUD shape: `set*` (bulk replace), `create*` (adds a `crypto.randomUUID()` id), `get*ByID`, `update*` (shallow patch via `Partial<New*>`), `delete*`. IDs are generated client-side, never server-assigned.

## Files

- **useClientStore.ts** — Manages `Client[]` (see [Client](../definitions/CLAUDE.md)). State: `clients`, `selectedClientID`. Persist key: `"clients"`. Simplest of the three stores — no derived/computed selectors, just CRUD plus a `selectedClientID` for UI selection state.

- **useEmployeeStore.ts** — Manages `Employee[]` (see [Employee](../definitions/CLAUDE.md)). State: `employees`, `selectedEmployeeID`. Persist key: `"employees"`. Same shape as `useClientStore.ts` — plain CRUD, no derived selectors. `deleteEmployee` returns `Result<void>` (see [errorHandling.md](../../aiNotes/errorHandling.md)): refuses with `{ kind: 'conflict' }` if any appointment's `employeeIDs` still references the employee, checked via `useAppointmentStore.getState()`.

- **useAppointmentStore.ts** — Manages `Appointment[]`. State: `appointments`, `selectedAppointmentID`, `selectedDay` (a `Date`, used to drive the calendar view — not persisted, since `partialize` restricts persistence to `appointments` only). Persist key: `"appointments"`. Persist `version: 1` with a `migrate` that backfills `name: ''`, `categoryIDs: []`, `employeeIDs: []`, `jobID: null` onto any pre-v1 persisted appointment missing them. Extra selectors beyond CRUD:
  - `getFutureAppointments()` — appointments from today onward, sorted by date.
  - `getMonthsAppointmentDates(year, month)` — deduped list of `Date`s with an appointment in a given month, used to mark the calendar.
  - `getDayAppointments(date)` — appointments on a given `YYYY-MM-DD` date, sorted by `startTime`.
  - `getAppointmentsByJobID(jobID)` — appointments whose `jobID` matches, used by the job detail view's financial rollup.

- **useAccountStore.ts** — Manages the connected backup-provider identity, `Account | null` (`provider`, `email`, `name`, `pictureUrl`). Persist key: `"account"`. Deliberately does **not** store an OAuth token — only the identity a user last consented as; `lib/backupProviders/googleDriveProvider.ts` requests a fresh access token per backup/restore action instead. No derived selectors, just `setAccount`/`clearAccount`.

- **useNotificationStore.ts** — Not persisted (ephemeral UI state, like `useAppointmentStore`'s `selectedDay`). Manages the toast queue: `push(message)` (called by `lib/notify.ts`), `dismiss(id)`. Rendered by `components/basic/toast/toast.tsx`.

- **useCategoryStore.ts** — Manages `Category[]` (see [Category](../definitions/CLAUDE.md)). State: `categories`. Persist key: `"categories"`. Same shape as `useClientStore.ts` — no derived selectors. `deleteCategory` returns `Result<void>`: refuses with `{ kind: 'conflict' }` if any appointment's `categoryIDs` still references it — the first store action in the codebase to implement errorHandling.md's conflict pattern; see its canonical examples section.

- **usePaymentStore.ts** — Manages `Payment[]`, the most complex store since payments are meaningless without their related `Appointment` and `Client`. State: `payments`, `selectedPaymentID`. Persist key: `"payments"`. Cross-store reads: pulls `appointments` from `useAppointmentStore` and `clients` from `useClientStore` (via `getState()`, not hooks) to join records into a `Collection { client, appointment }` shape (or, for received payments, a `ReceivedPayment { client, payment }` shape — see `getReceivedPayments()`). Derived selectors:
  - `getPaymentsOwed()` / `getPaymentsToPayout()` — collections where `paymentReceived` / `expensesPaid` is false, joined with client + appointment.
  - `getReceivedPayments()` — payments where `paymentReceived` is true, joined with client, sorted by parsed `payment.date` descending (most recent first).
  - `getTotalMadeThisWeek()` / `getTotalMadeThisMonth()` — sums `appointment.charge` for received payments since the start of the current week (Monday) / month, via local `startOfWeek`/`startOfMonth`/`totalReceivedSince` helpers defined at the top of the file.
  - `getTotalOwed()` — sum of `charge` across `getPaymentsOwed()`.
  - `getTotalNeededToPayOut()` — sum of `expense` across payments not yet paid out.
  - `getTotalCollected()` — all-time sum of `charge` across all received payments (`totalReceivedSince` with an unbounded `since`).
  - `getTotalNetAfterPayouts()` — `getTotalCollected()` minus the sum of `expense` across payments where `expensesPaid` is true (independent of `paymentReceived`, matching `getTotalNeededToPayOut()`'s filter shape).
  - `getAmountOwedByEmployee()` — for payments where `expensesPaid` is false, joins each payment's appointment to `useEmployeeStore`, splitting the appointment's `expense` evenly across its `employeeIDs` and summing per employee; appointments with no `employeeIDs` contribute nothing. Returns `{ employee, amount }[]`.
  - `payHelper(appointmentID)` — marks a payment's `expensesPaid` true by matching `appointmentID` (note: doesn't touch `paymentReceived`).

- **useJobStore.ts** — Manages `Job[]` (see [Job](../definitions/CLAUDE.md)). State: `jobs`, `selectedJobID`. Persist key: `"jobs"`. Same CRUD shape as `useClientStore.ts`. `deleteJob` returns `Result<void>`: refuses with `{ kind: 'conflict' }` if any appointment's `jobID` still references it.

## Gotchas

- Cross-store reads use `useXStore.getState()` inside actions/selectors rather than the `useXStore()` hook, since these run outside React render (needed to avoid stale closures / extra re-renders). Components calling these derived selectors should still wrap them in `useMemo` keyed on the relevant store's state, as done in [financePage.tsx](../pages/CLAUDE.md) and [appointmentsPage.tsx](../pages/CLAUDE.md) — the selector functions themselves aren't reactive subscriptions.
- Only `useAppointmentStore` uses `partialize`; the other two persist their entire state object as-is (including `selectedClientID`/`selectedPaymentID`).
