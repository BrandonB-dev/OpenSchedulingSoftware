import { useState } from "react"
import { useExpenseStore } from "../../stores/useExpenseStore"
import type { Expense } from "../../definitions/expense"
import Input from "../basic/input/input"
import Button from "../basic/button/button"
import Modal from "../modal/modal"

interface UpdateExpenseProps {
  expense: Expense
}

export default function UpdateExpense({ expense }: UpdateExpenseProps) {
  const updateExpense = useExpenseStore((s) => s.updateExpense)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [description, setDescription] = useState(expense.description)
  const [amount, setAmount] = useState(String(expense.amount))

  function handleOpen() {
    // Re-sync state from the latest expense prop in case it changed
    setDescription(expense.description)
    setAmount(String(expense.amount))
    setIsModalOpen(true)
  }

  function updateExpenseInfo() {
    updateExpense(expense.id, {
      description,
      amount: Number(amount) || 0,
    })
    setIsModalOpen(false)
  }

  return (
    <>
      <Button label="edit" onClick={handleOpen} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Expense"
      >
        <div className="flex flex-col gap-[18px] text-foreground">
          <div className="flex flex-col gap-2.5">
            <Input label="Description" placeholder="Cleaning supplies" value={description} onChange={setDescription} />
            <Input label="Amount" placeholder="0" inputMode="decimal" value={amount} onChange={setAmount} />
          </div>

          <div className="mt-1 flex flex-col border-t border-border pt-3 [&>*]:flex-1">
            <Button label="Save" onClick={updateExpenseInfo} />
          </div>
        </div>
      </Modal>
    </>
  )
}
