import { useState } from "react"
import Button from "../basic/button/button"
import Modal from "../modal/modal"
import { useExpenseStore } from "../../stores/useExpenseStore"

interface DeleteExpenseProps {
  expenseID: string
}

export default function DeleteExpense({ expenseID }: DeleteExpenseProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const deleteExpense = useExpenseStore((s) => s.deleteExpense)

  return (
    <>
      <Button label="x" onClick={() => setIsModalOpen(true)} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Deletion"
      >
        <p>
          Are you sure you would like to delete this Expense?
        </p>
        <Button label="yes" onClick={() => {
          deleteExpense(expenseID)
          setIsModalOpen(false)
        }} />
        <Button label="no" onClick={() => setIsModalOpen(false)} />
      </Modal>
    </>
  )
}
