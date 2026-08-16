# src/definitions

TypeScript type definitions (interfaces) for the app's core domain models. No logic, just shared shapes used across components, pages, hooks, and stores.

## Files

- **client.ts** — `Client` interface: a cleaning client's profile (id, name, address, phone, price, employee payment, default start/end time, notes, active status). The default start/end time auto-fill an appointment's time when that client is selected while creating a new appointment (mirroring how price/employee payment auto-fill charge/expense).
- **appointments.ts** — `Appointment` interface: a scheduled cleaning job (id, clientID, date, start/end time, charge, expense, show flag).
- **payments.ts** — `Payment` interface: payment record tied to an appointment (id, date received, method, paymentReceived/expensesPaid flags, appointmentID).
- **backupData.ts** — `BackupData` interface: the shape of a full data export/backup, aggregating `Appointment[]`, `Client[]`, and `Payment[]` with an `exportedAt` timestamp.
- **expense.ts** — `Expense` interface: an arbitrary job-cost line item (id, description, amount) tied to an appointment via `appointmentID`. Distinct from `Appointment.expense`, which is the employee payout field.
