import { useMemo } from "react"
import { ChartLine, Calendar, Clock, UserCheck, CreditCard, Wallet } from "lucide-react"
import FinanceCard from "../components/basic/cards/financeCard"
import CollectionsList from "../components/collectionsList/collectionsList"
import ReadPaymentHistory from "../components/collectionsList/readPaymentHistory"
import { usePaymentStore } from "../stores/usePaymentStore"

export default function FinancePage() {
  const payments = usePaymentStore((s) => s.payments)

  const totalWeek = useMemo(
    () => usePaymentStore.getState().getTotalMadeThisWeek(),
    [payments]
  )
  const totalMonth = useMemo(
    () => usePaymentStore.getState().getTotalMadeThisMonth(),
    [payments]
  )
  const totalOwed = useMemo(
    () => usePaymentStore.getState().getTotalOwed(),
    [payments]
  )
  const payout = useMemo(
    () => usePaymentStore.getState().getTotalNeededToPayOut(),
    [payments]
  )
  const totalCollected = useMemo(
    () => usePaymentStore.getState().getTotalCollected(),
    [payments]
  )
  const netAfterPayouts = useMemo(
    () => usePaymentStore.getState().getTotalNetAfterPayouts(),
    [payments]
  )
  const owedByEmployee = useMemo(
    () => usePaymentStore.getState().getAmountOwedByEmployee(),
    [payments]
  )

  return (
    <div className="mx-auto w-full max-w-[920px] px-4 pt-5 pb-[calc(44px+env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] text-foreground sm:px-5 sm:pt-7 sm:pb-14">
      <header className="mb-2">
        <h1 className="m-0 text-[22px] leading-tight font-bold text-primary sm:text-2xl">Finance</h1>
        <p className="mt-1 mb-0 text-sm text-muted-foreground">
          Track earnings, balances, and payouts
        </p>
      </header>

      <section className="mt-6 sm:mt-7">
        <span className="mb-2.5 block text-xs font-bold tracking-wider text-primary uppercase">Overview</span>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <FinanceCard
            label="This Week"
            amount={totalWeek}
            colorScheme="rose"
            icon={
              <ChartLine />
            }
          />
          <FinanceCard
            label="This Month"
            amount={totalMonth}
            colorScheme="blush"
            icon={
              <Calendar />
            }
          />
          <FinanceCard
            label="Total Owed"
            amount={totalOwed}
            colorScheme="deep"
            icon={
              <Clock />
            }
          />
          <FinanceCard
            label="Owed to Ines"
            amount={payout}
            colorScheme="plum"
            icon={
              <UserCheck />
            }
          />
          <FinanceCard
            label="Total Collected"
            amount={totalCollected}
            colorScheme="berry"
            icon={
              <CreditCard />
            }
          />
          <FinanceCard
            label="Net After Payouts"
            amount={netAfterPayouts}
            colorScheme="coral"
            icon={
              <Wallet />
            }
          />
        </div>
      </section>

      <section className="mt-6 sm:mt-7">
        <span className="mb-2.5 block text-xs font-bold tracking-wider text-primary uppercase">Owed to Employees</span>
        {owedByEmployee.length === 0 ? (
          <p className="text-sm text-muted-foreground">No employee payouts owed.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {owedByEmployee.map(({ employee, amount }) => (
              <FinanceCard
                key={employee.id}
                label={employee.name}
                amount={amount}
                colorScheme="plum"
                icon={<UserCheck />}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 sm:mt-7">
        <span className="mb-2.5 block text-xs font-bold tracking-wider text-primary uppercase">People Who Owe Money</span>
        <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <CollectionsList />
        </div>
      </section>

      <section className="mt-6 sm:mt-7">
        <span className="mb-2.5 block text-xs font-bold tracking-wider text-primary uppercase">Payment History</span>
        <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <ReadPaymentHistory />
        </div>
      </section>
    </div>
  )
}