# src/definitions

TypeScript type definitions (interfaces) for the app's core domain models. No logic, just shared shapes used across components, pages, hooks, and stores.

## Files

- **client.ts** — `Client` interface: a cleaning client's profile (id, name, address, phone, price, employee payment, default start/end time, notes, active status). The default start/end time auto-fill an appointment's time when that client is selected while creating a new appointment (mirroring how price/employee payment auto-fill charge/expense).
- **employee.ts** — `Employee` interface: who works for the operator (id, name, phone, notes, active status). Mirrors `Client`'s shape minus the client-specific pricing/scheduling fields.
- **appointments.ts** — `Appointment` interface: a scheduled cleaning job (id, clientID, date, start/end time, charge, expense, show flag).
- **payments.ts** — `Payment` interface: payment record tied to an appointment (id, date received, method, paymentReceived/expensesPaid flags, appointmentID).
- **backupData.ts** — `BackupData` interface: the shape of a full data export/backup, aggregating `Appointment[]`, `Client[]`, and `Payment[]` with an `exportedAt` timestamp.
- **job.ts** — `Job` interface: groups multiple appointments, expenses, and employees under one client project (id, clientID, name, description, status: `'active' | 'completed'`, createdDate). See `new_features/job.md`.
- **category.ts** — `Category` interface: a tag applied to appointments (id, name).
- **expense.ts** — `Expense` interface: an arbitrary job-cost line item (e.g. materials) logged against an appointment (id, appointmentID, description, amount). Distinct from `Appointment.expense` (the employee payout field). See `new_features/expenses.md`.
