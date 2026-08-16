# Appointment scope growth

Extends the core `Appointment` entity: a name, categories, employees assigned, and an
optional link to a parent `Job`. This is the **integration layer** — it only makes
sense once [employees.md](employees.md) Phase 0, [job.md](job.md) Phase 0, and this
file's own Category track exist. See [README.md](README.md) for the full
cross-file dependency graph; this file is "Phase 1" there.

Do not split the steps in §2 across parallel agents/sessions — they all edit
`definitions/appointments.ts` and `useAppointmentStore.ts`, so running them
concurrently will conflict. Everything in §1 (Categories) can run in parallel with
[employees.md](employees.md) Phase 0 and [job.md](job.md) Phase 0.

## §1 — Category entity (parallel-safe, no dependencies)

### Step 1.1: Define the Category type
**Prompt:** "Create `src/definitions/category.ts` exporting a `Category` interface:
`id: string`, `name: string`. Follow the shape/style of `src/definitions/client.ts`.
Add a one-line entry for it in `src/definitions/CLAUDE.md`'s Files list, matching the
existing bullet style."
**Verify:** `npx tsc -b`

### Step 1.2: Category store
**Prompt:** "Create `src/stores/useCategoryStore.ts`, a Zustand store for
`Category[]` following the exact CRUD pattern in `src/stores/useClientStore.ts`
(`create<...>()(persist(...))`, `setCategories`, `createCategory`, `getCategory`,
`updateCategory`, `deleteCategory`). Persist key `'categories'`. No derived
selectors needed yet. Add a bullet for it in `src/stores/CLAUDE.md`."
**Depends on:** Step 1.1
**Verify:** `npx tsc -b`

### Step 1.3: Category CRUD UI
**Prompt:** "Create a `src/components/categoriesList/` feature folder following the
shape of `src/components/clientsList/` (see `aiNotes/directoryLogic.md` §2): a
`categoriesList.tsx` container plus `createCategory.tsx`, `updateCategory.tsx`,
`deleteCategory.tsx`. Keep it simple — a category is just a name, so
`createCategory`/`updateCategory` are a single `Input` in a `Modal` (model the modal
usage on `src/components/clientsList/createClient.tsx`). `deleteCategory` should
follow `aiNotes/errorHandling.md`'s conflict pattern: return `Result` and refuse
with `{ kind: 'conflict' }` if any appointment's `categoryIDs` still references it
— but since `Appointment.categoryIDs` doesn't exist yet, leave a `// TODO(step 2.1):
add the conflict check once Appointment has categoryIDs` comment instead of a
broken import for now. Do NOT wire this into a new nav tab — mount `<CategoriesList
/>` inside a 'Manage Categories' button that opens it in a `Modal`, placed in
`src/pages/settingsPage.tsx` alongside the existing settings sections."
**Depends on:** Step 1.2
**Verify:** `npx tsc -b`, manually open Settings → Manage Categories, create/rename/delete a category

### Step 1.4: Tests
**Prompt:** "Write `src/stores/useCategoryStore.test.ts` following
`src/stores/useClientStore.test.ts`'s pattern (`resetStores()` in `beforeEach`,
builders — add a `buildCategory(overrides?)` to `src/testUtils/builders.ts` first).
Cover create/update/delete. Skip component tests for the modal forms for now (no
behavior beyond a single text field yet)."
**Depends on:** Step 1.3
**Verify:** `npm run test`

## §2 — Extend Appointment (sequential, single coordinated task)

Run §2 as one continuous task, not split across agents — it touches the same two
files (`definitions/appointments.ts`, `stores/useAppointmentStore.ts`) repeatedly.

### Step 2.1: Extend the Appointment type + migrate persisted data
**Prompt:** "Add four fields to the `Appointment` interface in
`src/definitions/appointments.ts`: `name: string`, `categoryIDs: string[]`,
`employeeIDs: string[]`, `jobID: string | null`. This app has real persisted data in
users' `localStorage` under the `'appointments'` key with none of these fields — add
a `migrate` function to `useAppointmentStore`'s `persist(...)` options (bump
`version` to `1`) that backfills `name: ''`, `categoryIDs: []`, `employeeIDs: []`,
`jobID: null` on any appointment missing them. Also add
`getAppointmentsByJobID(jobID: string): Appointment[]` to `useAppointmentStore`,
mirroring the `getDayAppointments` selector shape. Update the conflict-check TODOs
left in `categoriesList/deleteCategory.tsx` (from job.md/employees.md, if already
done) and in this task's own new `deleteEmployee`/`deleteJob`/`deleteCategory` files
to actually check `categoryIDs`/`employeeIDs`/`jobID` respectively — see
`aiNotes/errorHandling.md`'s conflict pattern, mirroring
`useClientStore.deleteClient`'s existing appointment-reference check."
**Depends on:** [employees.md](employees.md) Phase 0, [job.md](job.md) Phase 0, §1 above
**Verify:** `npx tsc -b`

### Step 2.2: Wire pickers into the appointment form
**Prompt:** "In `src/components/appointmentsList/createAppointment.tsx` and
`updateAppointment.tsx`, add: a `Name` text `Input` (following the `Name` field in
`clientsList/createClient.tsx`); a category picker using
`basic/autocomplete/autocomplete.tsx` in multi-select mode if it supports one,
otherwise a simple row of toggleable `Checkbox`-per-category reading
`useCategoryStore`; an employee picker, same pattern reading `useEmployeeStore`; and
a job picker (single-select, nullable) reading `useJobStore`, following
`basic/autocomplete/autocomplete.tsx`'s existing single-select usage for client
picking. Include the 'Manage Categories' entry point from Step 1.3 nearby if it
isn't already reachable from Settings alone — your call based on how it feels in
the form."
**Depends on:** Step 2.1
**Verify:** `npx tsc -b`, manually create/edit an appointment with a name, categories, employees, and a job

### Step 2.3: Show the new fields on the appointment card/detail view
**Prompt:** "Update `src/components/basic/cards/appointmentCard.tsx` to show the
appointment's `name` as its primary label (falling back to the client's name if
`name` is empty, for migrated old data) and a small category-tag row. Update
`src/components/appointmentsList/appointmentInfo.tsx` to also show assigned
employees (resolve names via `useEmployeeStore`) and, if `jobID` is set, a link/label
back to the parent job's name (resolve via `useJobStore`)."
**Depends on:** Step 2.2, [job.md](job.md) Phase 0 (for the job detail view to link to)
**Verify:** manually check the appointments list and detail view render correctly for both a new appointment and a pre-existing (migrated) one

### Step 2.4: Tests
**Prompt:** "Add test coverage for the `migrate` function and
`getAppointmentsByJobID` in `src/stores/useAppointmentStore.test.ts` (create this
file if it doesn't exist yet, following `useClientStore.test.ts`'s pattern). Add the
new conflict-check branches to `useEmployeeStore.test.ts`/`useJobStore.test.ts`/
`useCategoryStore.test.ts`'s delete tests (from Step 2.1)."
**Depends on:** Step 2.1–2.3
**Verify:** `npm run test`
