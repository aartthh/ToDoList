import { useState, useEffect } from 'react'
import Navbar from './Components/Navbar'
import { v4 as uuidv4 } from 'uuid';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

function App() {
  const [todo, setTodo] = useState("")
  const [todos, setTodos] = useState([])
  const [showFinished, setShowFinished] = useState(true)
  const [sortBy, setSortBy] = useState('dateCreated') // dateCreated, alphabetical, completed
  const [filterBy, setFilterBy] = useState('all') // all, completed, pending
  const [inputError, setInputError] = useState('')

  useEffect(() => {
    if (localStorage.getItem("todos")) {
      let todos = JSON.parse(localStorage.getItem("todos"))
      setTodos(todos);
    }
  }, [])

  useEffect(() => {
    saveToLs();
  }, [todos])

  const saveToLs = () => {
    localStorage.setItem("todos", JSON.stringify(todos))
  }

  // Enhanced input validation
  const validateInput = (input) => {
    if (!input.trim()) {
      return "Task cannot be empty"
    }
    if (input.trim().length < 3) {
      return "Task must be at least 3 characters long"
    }
    if (input.trim().length > 100) {
      return "Task cannot exceed 100 characters"
    }
    // Check for duplicate tasks
    const isDuplicate = todos.some(todo => 
      todo.todo.toLowerCase().trim() === input.toLowerCase().trim()
    )
    if (isDuplicate) {
      return "This task already exists"
    }
    return null
  }

  const toggleFinished = () => {
    setShowFinished(!showFinished)
  }

  const handleEdit = (id) => {
    let t = todos.filter(item => item.id === id)
    setTodo(t[0].todo)
    let newTodos = todos.filter(item => item.id !== id)
    setTodos(newTodos);
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      let newTodos = todos.filter(item => item.id !== id)
      setTodos(newTodos);
    }
  }

  const handleChange = (e) => {
    setTodo(e.target.value)
    // Clear error when user starts typing
    if (inputError) {
      setInputError('')
    }
  }

  const handleAdd = () => {
    const error = validateInput(todo)
    if (error) {
      setInputError(error)
      return
    }

    setTodos([...todos, { 
      id: uuidv4(), 
      todo: todo.trim(), 
      isCompleted: false,
      dateCreated: new Date().toISOString(),
      dateCompleted: null
    }])
    setTodo("")
    setInputError('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAdd()
    }
  }

  const handleCheckbox = (e) => {
    let id = e.target.name;
    let index = todos.findIndex(item => item.id === id)
    
    let newTodos = [...todos];
    newTodos[index].isCompleted = !newTodos[index].isCompleted;
    newTodos[index].dateCompleted = newTodos[index].isCompleted 
      ? new Date().toISOString() 
      : null;
    setTodos(newTodos);
  }

  // Sorting function
  const sortTodos = (todosToSort) => {
    const sorted = [...todosToSort].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.todo.toLowerCase().localeCompare(b.todo.toLowerCase())
        case 'completed':
          return a.isCompleted - b.isCompleted
        case 'dateCreated':
        default:
          return new Date(b.dateCreated) - new Date(a.dateCreated)
      }
    })
    return sorted
  }

  // Filtering function
  const filterTodos = (todosToFilter) => {
    let filtered = todosToFilter;
    
    // First apply the dropdown filter
    switch (filterBy) {
      case 'completed':
        filtered = todosToFilter.filter(todo => todo.isCompleted)
        break;
      case 'pending':
        filtered = todosToFilter.filter(todo => !todo.isCompleted)
        break;
      case 'all':
      default:
        filtered = todosToFilter;
        break;
    }
    
    // Then apply the "Show Finished" toggle only if filterBy is 'all'
    if (filterBy === 'all' && !showFinished) {
      filtered = filtered.filter(todo => !todo.isCompleted)
    }
    
    return filtered;
  }

  // Get processed todos (filtered and sorted)
  const getProcessedTodos = () => {
    let processed = filterTodos(todos)
    return sortTodos(processed)
  }

  const processedTodos = getProcessedTodos()

  return (
    <>
      <Navbar />
      <div className="md:container mx-3 md:mx-auto my-5 bg-yellow-300 rounded-xl p-5 min-h-[80vh] md:w-2/5">
        <h1 className='text-center font-bold text-3xl w-full'>iTask- Get your Job done!</h1>
        
        {/* Add Todo Section */}
        <div className="addtodo my-5 flex flex-col gap-5">
          <h1 className='text-xl font-bold'>Add Todos</h1>
          <div className="flex flex-col gap-2">
            <div className="flex">
              <input 
                type="text" 
                onChange={handleChange} 
                onKeyPress={handleKeyPress}
                value={todo} 
                placeholder="Enter your task (3-100 characters)"
                className={`w-full rounded-full px-3 py-1 font-serif border-2 ${
                  inputError ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={100}
              />
              <button 
                onClick={handleAdd} 
                disabled={!todo.trim()}
                className='bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed py-2 px-5 mx-2 text-black rounded-full font-bold transition-all'
              >
                Save
              </button>
            </div>
            {inputError && (
              <p className="text-red-600 text-sm font-semibold">{inputError}</p>
            )}
            <div className="text-xs text-gray-600">
              {todo.length}/100 characters
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="controls my-5 flex flex-col gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center">
              <input 
                onChange={toggleFinished} 
                type="checkbox" 
                checked={showFinished} 
                id='show'
                disabled={filterBy !== 'all'}
              />
              <label htmlFor="show" className={`mx-2 ${filterBy !== 'all' ? 'text-gray-400' : ''}`}>
                Show Finished {filterBy !== 'all' ? '(use filter dropdown)' : ''}
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <label htmlFor="sort">Sort by:</label>
              <select 
                id="sort"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-1 rounded border"
              >
                <option value="dateCreated">Date Created (Newest)</option>
                <option value="alphabetical">Alphabetical</option>
                <option value="completed">Completion Status</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="filter">Filter:</label>
              <select 
                id="filter"
                value={filterBy} 
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-2 py-1 rounded border"
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending Only</option>
                <option value="completed">Completed Only</option>
              </select>
            </div>
          </div>
        </div>

        <div className="h-[2px] bg-black opacity-60 w-[80%] my-3 mx-auto"></div>
        
        {/* Tasks Statistics */}
        <div className="stats mb-4 text-sm text-gray-700">
          <p>Total: {todos.length} | Completed: {todos.filter(t => t.isCompleted).length} | Pending: {todos.filter(t => !t.isCompleted).length}</p>
        </div>

        <h1 className='text-xl font-bold my-4'>Your Todos</h1>
        
        {/* Todos List */}
        <div className="todos">
          {processedTodos.length === 0 && (
            <div className='m-5 text-center text-gray-600'>
              {todos.length === 0 ? 'No todos yet! Add one above.' : 'No todos match your current filter.'}
            </div>
          )}
          {processedTodos.map(item => (
            <div key={item.id} className="todo flex justify-between my-3 p-2 bg-white bg-opacity-50 rounded-lg">
              <div className='flex gap-5 items-center flex-1'>
                <input 
                  onChange={handleCheckbox} 
                  type="checkbox" 
                  checked={item.isCompleted} 
                  name={item.id} 
                />
                <div className={`flex-1 ${item.isCompleted ? "line-through text-gray-500" : ""}`}>
                  <div>{item.todo}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Created: {new Date(item.dateCreated).toLocaleDateString()}
                    {item.dateCompleted && (
                      <span> | Completed: {new Date(item.dateCompleted).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className='buttons flex h-full gap-1'>
                <button 
                  onClick={() => handleEdit(item.id)} 
                  className='bg-orange-500 hover:bg-orange-600 p-2 py-1 text-black rounded-md font-serif flex items-center justify-center transition-all'
                  title="Edit task"
                >
                  <FaEdit />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)} 
                  className='bg-red-500 hover:bg-red-600 p-2 py-1 text-white rounded-md font-serif transition-all'
                  title="Delete task"
                >
                  <MdDelete />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default App