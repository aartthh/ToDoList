import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from './App'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock window.confirm
Object.defineProperty(window, 'confirm', { value: jest.fn(() => true) })

describe('React Todo App', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.clear.mockClear()
  })

  test('renders main components', () => {
    render(<App />)
    
    expect(screen.getByText('iTask- Get your Job done!')).toBeInTheDocument()
    expect(screen.getByText('Add Todos')).toBeInTheDocument()
    expect(screen.getByText('Your Todos')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your task/i)).toBeInTheDocument()
  })

  test('adds a new task successfully', async () => {
    render(<App />)
    
    const input = screen.getByPlaceholderText(/enter your task/i)
    const saveButton = screen.getByText('Save')
    
    fireEvent.change(input, { target: { value: 'Test task for unit testing' } })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('Test task for unit testing')).toBeInTheDocument()
    })
    
    expect(input.value).toBe('')
  })

  test('shows validation error for empty task', async () => {
    render(<App />)
    
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('Task cannot be empty')).toBeInTheDocument()
    })
  })

  test('shows validation error for short task', async () => {
    render(<App />)
    
    const input = screen.getByPlaceholderText(/enter your task/i)
    const saveButton = screen.getByText('Save')
    
    fireEvent.change(input, { target: { value: 'Hi' } })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('Task must be at least 3 characters long')).toBeInTheDocument()
    })
  })

  test('marks task as completed', async () => {
    render(<App />)
    
    // Add a task first
    const input = screen.getByPlaceholderText(/enter your task/i)
    const saveButton = screen.getByText('Save')
    
    fireEvent.change(input, { target: { value: 'Test completion task' } })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('Test completion task')).toBeInTheDocument()
    })
    
    // Mark as completed
    const checkbox = screen.getByRole('checkbox', { name: '' })
    fireEvent.click(checkbox)
    
    await waitFor(() => {
      const taskElement = screen.getByText('Test completion task')
      expect(taskElement).toHaveClass('line-through')
    })
  })

  test('deletes a task', async () => {
    render(<App />)
    
    // Add a task first
    const input = screen.getByPlaceholderText(/enter your task/i)
    const saveButton = screen.getByText('Save')
    
    fireEvent.change(input, { target: { value: 'Task to be deleted' } })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('Task to be deleted')).toBeInTheDocument()
    })
    
    // Delete the task
    const deleteButton = screen.getByTitle('Delete task')
    fireEvent.click(deleteButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Task to be deleted')).not.toBeInTheDocument()
    })
  })

  test('edits a task', async () => {
    render(<App />)
    
    // Add a task first
    const input = screen.getByPlaceholderText(/enter your task/i)
    const saveButton = screen.getByText('Save')
    
    fireEvent.change(input, { target: { value: 'Original task' } })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('Original task')).toBeInTheDocument()
    })
    
    // Edit the task
    const editButton = screen.getByTitle('Edit task')
    fireEvent.click(editButton)
    
    await waitFor(() => {
      expect(input.value).toBe('Original task')
    })
    
    // Change the task text
    fireEvent.change(input, { target: { value: 'Edited task' } })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('Edited task')).toBeInTheDocument()
      expect(screen.queryByText('Original task')).not.toBeInTheDocument()
    })
  })

  test('filters tasks correctly', async () => {
    render(<App />)
    
    const input = screen.getByPlaceholderText(/enter your task/i)
    const saveButton = screen.getByText('Save')
    
    // Add completed task
    fireEvent.change(input, { target: { value: 'Completed task' } })
    fireEvent.click(saveButton)
    
    // Add pending task
    fireEvent.change(input, { target: { value: 'Pending task' } })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('Completed task')).toBeInTheDocument()
      expect(screen.getByText('Pending task')).toBeInTheDocument()
    })
    
    // Mark first task as completed
    const checkboxes = screen.getAllByRole('checkbox')
    const taskCheckbox = checkboxes.find(cb => cb.name !== 'show')
    fireEvent.click(taskCheckbox)
    
    // Test filter
    const filterSelect = screen.getByLabelText('Filter:')
    fireEvent.change(filterSelect, { target: { value: 'completed' } })
    
    await waitFor(() => {
      expect(screen.getByText('Completed task')).toBeInTheDocument()
      expect(screen.queryByText('Pending task')).not.toBeInTheDocument()
    })
  })

  test('sorts tasks alphabetically', async () => {
    render(<App />)
    
    const input = screen.getByPlaceholderText(/enter your task/i)
    const saveButton = screen.getByText('Save')
    
    // Add tasks in reverse alphabetical order
    fireEvent.change(input, { target: { value: 'Zebra task' } })
    fireEvent.click(saveButton)
    
    fireEvent.change(input, { target: { value: 'Alpha task' } })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('Zebra task')).toBeInTheDocument()
      expect(screen.getByText('Alpha task')).toBeInTheDocument()
    })
    
    // Sort alphabetically
    const sortSelect = screen.getByLabelText('Sort by:')
    fireEvent.change(sortSelect, { target: { value: 'alphabetical' } })
    
    await waitFor(() => {
      const tasks = screen.getAllByText(/task$/)
      expect(tasks[0]).toHaveTextContent('Alpha task')
      expect(tasks[1]).toHaveTextContent('Zebra task')
    })
  })

  test('shows task statistics', async () => {
    render(<App />)
    
    const input = screen.getByPlaceholderText(/enter your task/i)
    const saveButton = screen.getByText('Save')
    
    // Initially should show 0 tasks
    expect(screen.getByText(/Total: 0/)).toBeInTheDocument()
    
    // Add a task
    fireEvent.change(input, { target: { value: 'Statistics test task' } })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Total: 1.*Completed: 0.*Pending: 1/)).toBeInTheDocument()
    })
  })

  test('handles Enter key for task addition', async () => {
    render(<App />)
    
    const input = screen.getByPlaceholderText(/enter your task/i)
    
    fireEvent.change(input, { target: { value: 'Enter key test task' } })
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 })
    
    await waitFor(() => {
      expect(screen.getByText('Enter key test task')).toBeInTheDocument()
    })
  })
})