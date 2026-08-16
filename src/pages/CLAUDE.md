# src/pages

Top-level route/page components, one per tab in the app's nav bar, plus the shared page shell that hosts them.

## Files

- **home.tsx**
  - Functional Purpose: Root page component. Owns the current `PageId` state, renders the sticky `NavBar`, and conditionally mounts `AppointmentsPage`, `FinancePage`, `ClientsPage`, or `SettingsPage` based on the selected tab.
  - Contextual Purpose: Just a container that loads the different pages.
- **appointmentsPage.tsx** 
  - Functional Purpose: Contains Calendar with event dates, appointment creation form, and lists of the selected day's and all appointments.
  - Contextual Purpose: This is the default landing page the user will see. Contains appointment information as well asany other information the use should see when the open the app for the first time.
- **clientsPage.tsx** 
  - Functional Purpose: Renders the `ClientsList` and a `CreateClient` form.
  - Contextual Purpose: This page will show any client related information the user needs to see.
- **employeesPage.tsx**
  - Functional Purpose: Renders the `EmployeesList` and a `CreateEmployee` form.
  - Contextual Purpose: Who works for the operator — separate from client data, mirrors `clientsPage.tsx`'s shape.
- **financePage.tsx** 
  - Functional Purpose: Summary cards (this week/month totals, total owed, payout owed) sourced from `usePaymentStore`, an "Owed to Employees" section (one `FinanceCard` per employee via `getAmountOwedByEmployee()`), plus a `CollectionsList` of people who owe money.
  - Contextual Purpose: Contains any financial information the user needs to see. 
- **settingsPage.tsx**
  - Functional Purpose: Hosts `GoogleAccount` (connect/backup/restore/disconnect Google Drive), `ImportExportData` (local JSON export/import), and the "Delete Data" action — moved here from `appointmentsPage.tsx`.
  - Contextual Purpose: The account/data-management tab — anything about where the user's data lives or how it's backed up, not about a specific client/appointment/payment.

Each page is styled inline with Tailwind utility classes directly in its `.tsx` file —
there is no shared `pages.css`; the four pages repeat the same layout utility strings
(max-width container, header, `mt-6 sm:mt-7` sections) rather than sharing a class.
