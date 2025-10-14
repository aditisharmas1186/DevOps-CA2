import { useState, useEffect } from 'react'
import axios from 'axios'

// Use environment variable or fallback to relative path for production
const API_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.MODE === 'production' ? '/api' : 'http://todo-server:5000/api'
)

function App() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState({ message: '', type: '' })
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })

  // Show status message
  const showStatus = (message, type = 'success') => {
    setStatus({ message, type })
    setTimeout(() => {
      setStatus({ message: '', type: '' })
    }, 3000)
  }

  // Fetch all todos
  const fetchTodos = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/todos`)
      setTodos(response.data)
    } catch (error) {
      console.error('Error fetching todos:', error)
      showStatus('Error fetching todos: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Add new todo
  const addTodo = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      showStatus('Title is required!', 'error')
      return
    }

    try {
      await axios.post(`${API_URL}/todos`, {
        title: formData.title.trim(),
        description: formData.description.trim()
      })
      
      showStatus('Todo added successfully!')
      setFormData({ title: '', description: '' })
      fetchTodos()
    } catch (error) {
      console.error('Error adding todo:', error)
      showStatus('Error adding todo: ' + error.message, 'error')
    }
  }

  // Delete todo
  const deleteTodo = async (id) => {
    try {
      await axios.post(`${API_URL}/todos/delete`, { id })
      showStatus('Todo deleted successfully!')
      fetchTodos()
    } catch (error) {
      console.error('Error deleting todo:', error)
      showStatus('Error deleting todo: ' + error.message, 'error')
    }
  }

  // Toggle todo completion
  const toggleTodo = async (id, completed) => {
    try {
      await axios.post(`${API_URL}/todos/modify`, {
        id,
        completed: !completed
      })
      showStatus('Todo updated successfully!')
      fetchTodos()
    } catch (error) {
      console.error('Error updating todo:', error)
      showStatus('Error updating todo: ' + error.message, 'error')
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Load todos on component mount
  useEffect(() => {
    fetchTodos()
  }, [])

  return (
    <div className="container">
      <h1>Todo App</h1>
      
      {status.message && (
        <div className={`status ${status.type}`}>
          {status.message}
        </div>
      )}
      
      <div className="form-section">
        <form onSubmit={addTodo}>
          <div className="form-group">
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Add Todo
          </button>
        </form>
      </div>

      <div className="todos-section">
        {loading ? (
          <div className="loading">Loading todos...</div>
        ) : todos.length === 0 ? (
          <div className="empty-state">
            <p>No todos found. Add one above!</p>
          </div>
        ) : (
          todos.map(todo => (
            <div key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <div className="todo-title">{todo.title}</div>
              <div className="todo-description">
                {todo.description || 'No description'}
              </div>
              <div className="todo-meta">
                Created: {new Date(todo.createdAt).toLocaleDateString()}
              </div>
              <div className="todo-actions">
                <button
                  className="btn btn-success btn-small"
                  onClick={() => toggleTodo(todo._id, todo.completed)}
                >
                  {todo.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => deleteTodo(todo._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default App