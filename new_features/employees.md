# Employees

Lets the user track who works for them (name, contact info), assign employees to
appointments, and see what's owed to each employee individually on the Finance page.
See [README.md](README.md) for how this fits with the other three feature files.

## Phase 0 — Employee CRUD (parallel-safe: no dependency on any other new_features file)

### Step 1: Define the Employee type
**Prompt:** "Create `src/definitions/employee.ts` exporting an `Employee`
interface: `id: string`, `name: string`, `phoneNumber: string`, `notes: string[]`,
`active: boolean`. Mirror the style of `src/definitions/client.ts` (which has an
almost identical shape). Add a bullet for it in `src/definitions/CLAUDE.md`."
**Verify:** `npx tsc -b`

### Step 2: Employee store
**Prompt:** "Create `src/stores/useEmployeeStore.ts` for `Employee[]`, following
`src/stores/useClientStore.ts`'s exact CRUD pattern (`setEmployees`,
`createEmployee`, `getEmployee`, `updateEmployee`, `deleteEmployee`,
`selectedEmployeeID`). Persist key `'employees'`. For now `deleteEmployee` is
unconditional (no conflict check yet — appointments can't reference employees
until `appointmentScopeGrowth.md` Step 2.1 lands; leave a `// TODO(appointmentScopeGrowth
Step 2.1): block delete if referenced by an appointment` comment). Add a bullet in
`src/stores/CLAUDE.md`."
**Depends on:** Step 1
**Verify:** `npx tsc -b`

### Step 3: Employee CRUD UI
**Prompt:** "Create a `src/components/employeesList/` feature folder mirroring
`src/components/clientsList/` (see `aiNotes/directoryLogic.md` §2 for the
container/create/read/update/delete shape): `employeesList.tsx`,
`createEmployee.tsx`, `readEmployees.tsx`, `updateEmployee.tsx`,
`deleteEmployee.tsx`, `employeeCard.tsx`. Base the form fields and layout directly
on `src/components/clientsList/createClient.tsx` (Name, Phone Number, Notes,
Active switch) — drop the price/employeePayment/default-time fields, those are
client-specific. Use `basic/button/button.tsx`, `basic/input/input.tsx`,
`basic/switch/switch.tsx`, `components/modal/modal.tsx` as in that reference file."
**Depends on:** Step 2
**Verify:** `npx tsc -b`

### Step 4: New nav tab for Employees
**Prompt:** "Add `'employees'` to the `PageId` union and `NAV_ITEMS` array in
`src/components/basic/navbar/navbar.tsx` (pick a `lucide-react` icon distinct from
the existing ones, e.g. `HardHat` or `UserCog`, `aria-hidden` per
`aiNotes/design.md` §2). Create `src/pages/employeesPage.tsx` following
`src/pages/clientsPage.tsx`'s shape (renders `<EmployeesList />` and
`<CreateEmployee />`). Wire the new page into the switch in `src/pages/home.tsx`."
**Depends on:** Step 3
**Verify:** `npx tsc -b`, manually open the new Employees tab and create/edit/delete an employee

### Step 5: Tests
**Prompt:** "Write `src/stores/useEmployeeStore.test.ts` following
`src/stores/useClientStore.test.ts` (add `buildEmployee(overrides?)` to
`src/testUtils/builders.ts` first). Cover create/update/delete. Write
`src/components/employeesList/createEmployee.test.tsx` as the first component
*form* test in this repo — validation → inline error → successful submit calling
`createEmployee` — following the Testing Library pattern in
`aiNotes/testing.md` §2's example. This becomes the canonical form-test example
testing.md is waiting on; link it into `aiNotes/testing.md`'s 'Still none yet'
section under Canonical examples once written."
**Depends on:** Step 4
**Verify:** `npm run test`

## Phase 2B — Finance page: per-employee owed (sequential, after appointmentScopeGrowth.md §2)

This needs `Appointment.employeeIDs` to exist first — see
[appointmentScopeGrowth.md](appointmentScopeGrowth.md) §2. It does **not** need
[job.md](job.md) or [expenses.md](expenses.md) — it can run in parallel with those
once §2 lands.

### Step 6: Per-employee owed selector
**Prompt:** "Add a `getAmountOwedByEmployee(): { employee: Employee; amount:
number }[]` selector to `src/stores/usePaymentStore.ts`, following the cross-store
join pattern already used there (`useAppointmentStore.getState()`,
`useClientStore.getState()` — same idea but joining `useEmployeeStore.getState()`
via each unpaid payment's appointment's `employeeIDs`). For an appointment with
multiple employees, split its `expense` evenly across them unless you find an
existing per-employee split convention in the codebase — if unsure, ask rather
than guessing at a split rule. Sum only payments where `expensesPaid` is false,
matching `getTotalNeededToPayOut()`'s filter."
**Depends on:** `appointmentScopeGrowth.md` §2, Step 5 above
**Verify:** `npx tsc -b`

### Step 7: Render it on the Finance page
**Prompt:** "In `src/pages/financePage.tsx`, add a section listing each employee
and what's owed to them, using `getAmountOwedByEmployee()` from Step 6. Reuse
`basic/cards/payoutCard.tsx` or `financeCard.tsx` per-employee, matching how the
existing 'Owed to Ines'-style total payout card is rendered nearby — read that
existing card's usage first and follow its exact pattern rather than introducing a
new card shape."
**Depends on:** Step 6
**Verify:** `npx tsc -b`, manually check the Finance page's new employee section against a seeded appointment with employees assigned

### Step 8: Tests
**Prompt:** "Add tests for `getAmountOwedByEmployee` to
`src/stores/usePaymentStore.test.ts`, covering: single employee on an appointment,
multiple employees split, and an appointment with `employeeIDs: []` (excluded)."
**Depends on:** Step 7
**Verify:** `npm run test`
