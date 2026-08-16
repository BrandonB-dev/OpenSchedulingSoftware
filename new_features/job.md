# Jobs

A `Job` groups multiple appointments, their expenses, and assigned employees under
one client project (e.g. a multi-day construction job, not a single cleaning visit).
See [README.md](README.md) for how this fits with the other three feature files.

## Phase 0b — Job CRUD (parallel-safe: no dependency on any other new_features file)

### Step 1: Define the Job type
**Prompt:** "Create `src/definitions/job.ts` exporting a `Job` interface:
`id: string`, `clientID: string`, `name: string`, `description: string`,
`status: 'active' | 'completed'`, `createdDate: string`. Follow the field-naming
style of `src/definitions/appointments.ts` (`clientID`, not `clientId`). Add a
bullet in `src/definitions/CLAUDE.md`."
**Verify:** `npx tsc -b`

### Step 2: Job store
**Prompt:** "Create `src/stores/useJobStore.ts` for `Job[]`, following
`src/stores/useClientStore.ts`'s CRUD pattern (`setJobs`, `createJob`, `getJob`,
`updateJob`, `deleteJob`, `selectedJobID`). Persist key `'jobs'`. For now
`deleteJob` is unconditional — appointments can't reference a job until
`appointmentScopeGrowth.md` Step 2.1 lands; leave a `// TODO(appointmentScopeGrowth
Step 2.1): block delete if any appointment.jobID references this job` comment. Add
a bullet in `src/stores/CLAUDE.md`."
**Depends on:** Step 1
**Verify:** `npx tsc -b`

### Step 3: Job CRUD UI + detail view (no router — swap in place)
**Prompt:** "Create a `src/components/jobsList/` feature folder: `jobsList.tsx`
(container, renders a list of `jobCard.tsx` entries plus `createJob.tsx`, follow
`clientsList/clientsList.tsx`'s composition), `createJob.tsx` (Name, Client picker
via `basic/autocomplete/autocomplete.tsx` reading `useClientStore` — same picker
usage as an appointment's client field, Description textarea, Status — model the
form on `clientsList/createClient.tsx`), `updateJob.tsx`, `deleteJob.tsx`,
`jobCard.tsx`. This app has no router (see `aiNotes/directoryLogic.md` — pages
switch via state in `home.tsx`, same pattern `appointmentsPage.tsx` uses for
`selectedDay`), so add `selectedJobID` to `useJobStore` (already scaffolded in
Step 2) and have `jobsList.tsx` conditionally render a `jobDetail.tsx` component
in place of the list when a job is selected, instead of navigating to a new route.
For now `jobDetail.tsx` just shows the job's own fields (name, client, description,
status) plus an update/delete affordance — the appointments/expenses/employee
rollup comes in Phase 2 below."
**Depends on:** Step 2
**Verify:** `npx tsc -b`

### Step 4: New nav tab for Jobs
**Prompt:** "Add `'jobs'` to the `PageId` union and `NAV_ITEMS` array in
`src/components/basic/navbar/navbar.tsx` (pick a `lucide-react` icon distinct from
existing ones and from `employees.md`'s choice, e.g. `Briefcase`, `aria-hidden` per
`aiNotes/design.md` §2). Create `src/pages/jobsPage.tsx` following
`src/pages/clientsPage.tsx`'s shape, rendering `<JobsList />`. Wire it into the
switch in `src/pages/home.tsx`."
**Depends on:** Step 3
**Verify:** `npx tsc -b`, manually open the Jobs tab, create a job, click into it, edit and delete it

### Step 5: Tests
**Prompt:** "Write `src/stores/useJobStore.test.ts` following
`src/stores/useClientStore.test.ts` (add `buildJob(overrides?)` to
`src/testUtils/builders.ts`). Cover create/update/delete. Write
`src/components/jobsList/createJob.test.tsx` as a form test, following the pattern
in `employees.md`'s `createEmployee.test.tsx` once that exists, or
`aiNotes/testing.md` §2 directly."
**Depends on:** Step 4
**Verify:** `npm run test`

## Phase 2 — Job detail financial rollup (sequential, after appointmentScopeGrowth.md §2 and expenses.md Phase 0c)

This is the real payoff of both this file and `expenses.md`: seeing a job's full
financial picture in one place.

### Step 6: Roll up appointments/expenses/employees/payments onto the job detail view
**Prompt:** "Expand `src/components/jobsList/jobDetail.tsx` (from Step 3) to show:
the job's appointments (`useAppointmentStore.getState().getAppointmentsByJobID(job.id)`,
added in `appointmentScopeGrowth.md` Step 2.1), each appointment's expenses
(`useExpenseStore`'s `getExpensesByAppointmentID`, from `expenses.md` Step 2) and
assigned employees (resolve names via `useEmployeeStore`), and payment status per
appointment (`usePaymentStore` — reuse `basic/cards/collectionCard.tsx` or
`paymentHistoryCard.tsx` per the existing pattern rather than inventing new
markup). Add job-level totals: total charged, total material expenses, total
employee payout, total collected, net — following the summation style already used
in `usePaymentStore.ts`'s `getTotalNetAfterPayouts()`."
**Depends on:** `appointmentScopeGrowth.md` §2, `expenses.md` Phase 0c
**Verify:** `npx tsc -b`, manually seed a job with 2-3 appointments, expenses, and employees, and check every total against hand math

### Step 7: Tests
**Prompt:** "If any new derived-total logic from Step 6 ended up in a store (rather
than computed inline in the component), add tests for it following
`usePaymentStore.test.ts`'s pattern for its `getTotal*` selectors. If the totals
stayed as plain component-local `reduce`s with no branching logic, per
`aiNotes/testing.md` §1's priority order this doesn't need a dedicated test —
say so explicitly rather than adding one for coverage's sake."
**Depends on:** Step 6
**Verify:** `npm run test` (if a test was added)

## Deferred: client-facing shareable job link

**Not being built yet — this is a documented open question, not a task.**

The original ask was a link a client can open to see their job's appointments,
material costs, and scope — without the client having your login or the app
installed. That conflicts with this app's core architecture
(`aiNotes/global.md` §1): there is no backend, and all data lives in
`localStorage` on your phone only. A link opened on the client's device has no way
to reach that data as things stand today.

Decided: **defer.** Revisit only if this becomes a real need. When it does, the
options on the table are:
1. Encode a snapshot of the job's data directly in the URL (base64/compressed query
   param) — no backend, but the link is static (must be regenerated whenever the
   job changes) and exposes financial details to anyone holding the URL.
2. Add a minimal hosted backend (e.g. a small serverless endpoint or a service like
   Supabase/Firebase) solely to serve read-only job snapshots — the biggest lift,
   and a real architecture change for a single-user local app.

Do not start on this without re-confirming the approach — it's the one place in
these four files where the right first step is a design decision, not code.
