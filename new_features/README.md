# new_features — execution plan

Four feature files, each broken into bite-sized Claude-ready steps:
[employees.md](employees.md), [expenses.md](expenses.md), [job.md](job.md),
[appointmentScopeGrowth.md](appointmentScopeGrowth.md). They share entities, so
build order matters more than file order. This is the dependency graph across all
four.

## Phase 0 — four independent tracks, run fully in parallel

None of these touch a shared file, so they're safe to run as separate parallel
sessions/agents:

| Track | File | Steps | Produces |
|---|---|---|---|
| A | employees.md | 1–5 | `Employee` type, store, CRUD UI, new "Employees" nav tab |
| B | job.md | 1–5 | `Job` type, store, CRUD UI + in-place detail view, new "Jobs" nav tab |
| C | expenses.md | 1–3 | `Expense` type, store, selectors — **type/store only, no UI yet** |
| D | appointmentScopeGrowth.md | 1.1–1.4 | `Category` type, store, CRUD UI (reachable from Settings) |

## Phase 1 — sequential, single task, blocks everything after it

**appointmentScopeGrowth.md §2** (Steps 2.1–2.4). Extends `Appointment` with
`name`, `categoryIDs`, `employeeIDs`, `jobID`, migrates existing persisted
appointments, and wires pickers into the appointment form. This repeatedly edits
the same two files (`definitions/appointments.ts`, `useAppointmentStore.ts`), so
don't split it across agents even though its steps are numbered separately.

**Requires Phase 0 A, B, D complete first** (needs `Employee`, `Job`, and
`Category` stores to exist to build pickers against). Does not need Phase 0 C
(`Expense`) — expenses aren't referenced from `Appointment` directly.

## Phase 2 — two independent tracks, run in parallel

Both only depend on Phase 1 being done; they don't touch each other's files.

| Track | Files/Steps | Depends on |
|---|---|---|
| 2A | expenses.md Step 4–5 (expense CRUD UI on an appointment), then job.md Step 6–7 (job detail financial rollup) — keep these two sequential *within* the track, since the rollup is easiest to verify once real expense data exists | Phase 1, Phase 0 C |
| 2B | employees.md Step 6–8 (Finance page per-employee owed section) | Phase 1, Phase 0 A |

## Deferred (not scheduled)

**job.md's client-facing shareable link.** Conflicts with the app's no-backend,
localStorage-only architecture (see `aiNotes/global.md` §1) — a link opened on a
client's device can't reach data that lives only on your phone. Decision recorded
in job.md's "Deferred" section: revisit later, don't build against it yet.

## Summary

```
Phase 0 (parallel: A, B, C, D)
        │
        ▼
Phase 1 (sequential: appointmentScopeGrowth.md §2)
        │
        ├──────────────┐
        ▼              ▼
   Phase 2A         Phase 2B
 (expenses → job    (Finance page
  rollup)            per-employee)

Deferred: client-facing job link (job.md)
```

Total: ~4 parallel tracks → 1 blocking integration step → 2 parallel finishing
tracks. The only hard serialization point is Phase 1; everything else is
parallelizable in pairs or quads.
