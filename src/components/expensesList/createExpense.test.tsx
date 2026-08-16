import { describe, it, expect, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '../../testUtils/render'
import CreateExpense from './createExpense'
import { resetStores } from '../../testUtils/resetStores'
import { useExpenseStore } from '../../stores/useExpenseStore'

describe('CreateExpense', () => {
  beforeEach(() => resetStores())

  it('shows an inline error when description is empty on submit', async () => {
    render(<CreateExpense appointmentID="appt-1" />)
    await userEvent.click(screen.getByRole('button', { name: /add expense/i }))

    await userEvent.type(screen.getByRole('textbox', { name: /amount/i }), '50')
    await userEvent.click(screen.getByRole('button', { name: /done/i }))

    expect(screen.getByText(/description is required/i)).toBeInTheDocument()
    expect(useExpenseStore.getState().expenses).toHaveLength(0)
  })

  it('shows an inline error when amount is non-numeric on submit', async () => {
    render(<CreateExpense appointmentID="appt-1" />)
    await userEvent.click(screen.getByRole('button', { name: /add expense/i }))

    await userEvent.type(screen.getByRole('textbox', { name: /description/i }), 'Paint')
    await userEvent.type(screen.getByRole('textbox', { name: /amount/i }), 'not-a-number')
    await userEvent.click(screen.getByRole('button', { name: /done/i }))

    expect(screen.getByText(/amount must be a number/i)).toBeInTheDocument()
    expect(useExpenseStore.getState().expenses).toHaveLength(0)
  })

  it('creates the expense and closes the modal on a valid submit', async () => {
    render(<CreateExpense appointmentID="appt-1" />)
    await userEvent.click(screen.getByRole('button', { name: /add expense/i }))

    await userEvent.type(screen.getByRole('textbox', { name: /description/i }), 'Paint')
    await userEvent.type(screen.getByRole('textbox', { name: /amount/i }), '50')
    await userEvent.click(screen.getByRole('button', { name: /done/i }))

    const expenses = useExpenseStore.getState().expenses
    expect(expenses).toHaveLength(1)
    expect(expenses[0]).toMatchObject({
      appointmentID: 'appt-1',
      description: 'Paint',
      amount: 50,
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
