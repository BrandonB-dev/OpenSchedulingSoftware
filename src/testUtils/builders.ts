import type { Client } from '../definitions/client'
import type { Employee } from '../definitions/employee'
import type { Appointment } from '../definitions/appointments'
import type { Payment } from '../definitions/payments'
import type { Job } from '../definitions/job'
import type { Category } from '../definitions/category'
import type { Expense } from '../definitions/expense'

let counter = 0
function nextId(prefix: string): string {
  counter += 1
  return `${prefix}-${counter}`
}

export function buildClient(overrides: Partial<Client> = {}): Client {
  return {
    id: nextId('client'),
    name: 'Test Client',
    address: '123 Main St',
    phoneNumber: '000-000-0000',
    price: 100,
    employeePayment: 25,
    defaultStartTime: '9:00 AM',
    defaultEndTime: '10:00 AM',
    notes: [],
    active: true,
    ...overrides,
  }
}

export function buildEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: nextId('employee'),
    name: 'Test Employee',
    phoneNumber: '000-000-0000',
    notes: [],
    active: true,
    ...overrides,
  }
}

export function buildAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: nextId('appointment'),
    clientID: nextId('client'),
    date: '2026-01-01',
    charge: 100,
    startTime: '9:00 AM',
    endTime: '10:00 AM',
    expense: 25,
    show: true,
    name: 'Test Appointment',
    categoryIDs: [],
    employeeIDs: [],
    jobID: null,
    ...overrides,
  }
}

export function buildCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: nextId('category'),
    name: 'Test Category',
    ...overrides,
  }
}

export function buildPayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: nextId('payment'),
    date: '2026-01-01',
    method: 'venmo',
    paymentReceived: false,
    expensesPaid: false,
    appointmentID: nextId('appointment'),
    ...overrides,
  }
}

export function buildJob(overrides: Partial<Job> = {}): Job {
  return {
    id: nextId('job'),
    clientID: nextId('client'),
    name: 'Test Job',
    description: 'A test job',
    status: 'active',
    createdDate: '2026-01-01',
    ...overrides,
  }
}

export function buildExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: nextId('expense'),
    appointmentID: nextId('appointment'),
    description: 'Test Expense',
    amount: 50,
    ...overrides,
  }
}
