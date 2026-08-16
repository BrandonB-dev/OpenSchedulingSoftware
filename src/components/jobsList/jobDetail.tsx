import { useMemo } from "react"
import { ChevronLeft, FileText, User, DollarSign, Package, UserCheck, CreditCard, Wallet } from "lucide-react"
import { useJobStore } from "../../stores/useJobStore"
import { useClientStore } from "../../stores/useClientStore"
import { useAppointmentStore } from "../../stores/useAppointmentStore"
import { useExpenseStore } from "../../stores/useExpenseStore"
import { usePaymentStore } from "../../stores/usePaymentStore"
import JobAppointmentCard from "../basic/cards/jobAppointmentCard"
import FinanceCard from "../basic/cards/financeCard"
import UpdateJob from "./updateJob"
import DeleteJob from "./deleteJob"
import { cn } from "../../lib/utils"

interface JobDetailProps {
  jobID: string
}

export default function JobDetail({ jobID }: JobDetailProps) {
  const job = useJobStore((s) => s.jobs.find((j) => j.id === jobID))
  const setSelectedJobID = useJobStore((s) => s.setSelectedJobID)
  const client = useClientStore((s) => s.clients.find((c) => c.id === job?.clientID))

  const appointmentsState = useAppointmentStore((s) => s.appointments)
  const expensesState = useExpenseStore((s) => s.expenses)
  const paymentsState = usePaymentStore((s) => s.payments)

  const jobAppointments = useMemo(
    () => useAppointmentStore.getState().getAppointmentsByJobID(jobID),
    [appointmentsState, jobID]
  )

  const totals = useMemo(() => {
    const getExpensesByAppointmentID = useExpenseStore.getState().getExpensesByAppointmentID
    const totalCharged = jobAppointments.reduce((sum, a) => sum + a.charge, 0)
    const totalEmployeePayout = jobAppointments.reduce((sum, a) => sum + a.expense, 0)
    const totalMaterialExpenses = jobAppointments.reduce(
      (sum, a) => sum + getExpensesByAppointmentID(a.id).reduce((s, e) => s + e.amount, 0),
      0
    )
    const totalCollected = jobAppointments
      .filter((a) => paymentsState.some((p) => p.appointmentID === a.id && p.paymentReceived))
      .reduce((sum, a) => sum + a.charge, 0)
    const paidOutToEmployee = jobAppointments
      .filter((a) => paymentsState.some((p) => p.appointmentID === a.id && p.expensesPaid))
      .reduce((sum, a) => sum + a.expense, 0)
    const net = totalCollected - totalMaterialExpenses - paidOutToEmployee

    return { totalCharged, totalEmployeePayout, totalMaterialExpenses, totalCollected, net }
  }, [jobAppointments, paymentsState, expensesState])

  // deleteJob clears a matching selectedJobID in the same store update, so
  // this only guards the brief re-render between that state change and
  // jobsList swapping back to the list view.
  if (!job) return null

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        className="flex w-fit items-center gap-1 rounded-lg border-0 bg-transparent p-0 text-sm font-semibold text-primary transition-colors hover:underline"
        onClick={() => setSelectedJobID(null)}
      >
        <ChevronLeft width={16} height={16} aria-hidden="true" />
        Back to Jobs
      </button>

      <div className="flex items-start justify-between gap-3">
        <h2 className="m-0 text-xl leading-tight font-bold text-foreground">{job.name}</h2>
        <span
          className={cn(
            "inline-flex w-fit shrink-0 items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase",
            job.status === "active" && "bg-primary/10 text-primary"
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-[0.85]" />
          {job.status === "active" ? "Active" : "Completed"}
        </span>
      </div>

      <div className="flex items-start gap-2.5">
        <div className="shrink-0 pt-0.5 text-primary">
          <User width={14} height={14} aria-hidden="true" />
        </div>
        <div className="flex min-w-0 flex-col gap-px">
          <span className="text-[10px] font-bold tracking-wider text-primary uppercase">Client</span>
          <span className="text-sm break-words text-foreground">{client?.name ?? "Unknown client"}</span>
        </div>
      </div>

      {job.description && (
        <div className="flex items-start gap-2.5">
          <div className="shrink-0 pt-0.5 text-primary">
            <FileText width={14} height={14} aria-hidden="true" />
          </div>
          <div className="flex min-w-0 flex-col gap-px">
            <span className="text-[10px] font-bold tracking-wider text-primary uppercase">Description</span>
            <span className="text-sm break-words text-foreground">{job.description}</span>
          </div>
        </div>
      )}

      <div className="mt-2 flex flex-col gap-2.5 border-t border-border pt-4">
        <span className="text-[10px] font-bold tracking-wider text-primary uppercase">Financials</span>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <FinanceCard label="Total Charged" amount={totals.totalCharged} colorScheme="rose" icon={<DollarSign />} />
          <FinanceCard label="Material Expenses" amount={totals.totalMaterialExpenses} colorScheme="blush" icon={<Package />} />
          <FinanceCard label="Employee Payout" amount={totals.totalEmployeePayout} colorScheme="plum" icon={<UserCheck />} />
          <FinanceCard label="Total Collected" amount={totals.totalCollected} colorScheme="berry" icon={<CreditCard />} />
          <FinanceCard label="Net" amount={totals.net} colorScheme="coral" icon={<Wallet />} />
        </div>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-border pt-4">
        <span className="text-[10px] font-bold tracking-wider text-primary uppercase">Appointments</span>
        {jobAppointments.length === 0 ? (
          <p className="m-0 text-sm text-muted-foreground">No appointments assigned to this job yet.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {jobAppointments.map((appointment) => (
              <JobAppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2.5 border-t border-border pt-4 [&>*]:flex-1">
        <UpdateJob job={job} />
        <DeleteJob jobID={job.id} />
      </div>
    </div>
  )
}
