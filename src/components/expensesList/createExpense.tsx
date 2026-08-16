import { useState } from "react"
import { useExpenseStore } from "../../stores/useExpenseStore"
import type { Expense } from "../../definitions/expense"
import Button from "../basic/button/button"
import Input from "../basic/input/input"
import Modal from "../modal/modal"

type NewExpense = Omit<Expense, "id">

interface CreateExpenseProps {
  appointmentID: string
}

export default function CreateExpense({ appointmentID }: CreateExpenseProps) {
  const createExpense = useExpenseStore((s) => s.createExpense)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [descriptionError, setDescriptionError] = useState<string | null>(null)
  const [amountError, setAmountError] = useState<string | null>(null)

  function resetForm() {
    setDescription("")
    setAmount("")
    setDescriptionError(null)
    setAmountError(null)
  }

  function addExpense() {
    const trimmedDescription = description.trim()
    const parsedAmount = Number(amount)

    let hasError = false
    if (!trimmedDescription) {
      setDescriptionError("Description is required")
      hasError = true
    }
    if (amount.trim() === "" || Number.isNaN(parsedAmount)) {
      setAmountError("Amount must be a number")
      hasError = true
    }
    if (hasError) return

    const tempExpense: NewExpense = {
      appointmentID,
      description: trimmedDescription,
      amount: parsedAmount,
    }

    createExpense(tempExpense)
    resetForm()
    setIsModalOpen(false)
  }

  return (
    <>
      <Button label="Add Expense" onClick={() => setIsModalOpen(true)} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Expense"
      >
        <div className="flex flex-col gap-[18px] text-foreground">
          <div className="flex flex-col gap-2.5">
            <Input
              label="Description"
              placeholder="Cleaning supplies"
              value={description}
              onChange={(v) => {
                setDescription(v)
                if (descriptionError) setDescriptionError(null)
              }}
            />
            {descriptionError && <span className="text-sm text-destructive">{descriptionError}</span>}

            <Input
              label="Amount"
              placeholder="0"
              inputMode="decimal"
              value={amount}
              onChange={(v) => {
                setAmount(v)
                if (amountError) setAmountError(null)
              }}
            />
            {amountError && <span className="text-sm text-destructive">{amountError}</span>}
          </div>

          <div className="mt-1 flex flex-col border-t border-border pt-3 [&>*]:flex-1">
            <Button label="Done" onClick={addExpense} />
          </div>
        </div>
      </Modal>
    </>
  )
}
