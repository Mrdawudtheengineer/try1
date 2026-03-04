import React, { useEffect, useState } from 'react'

export default function TasksPanel({ telemetry, onLog }) {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [priority, setPriority] = useState('medium')

  function addTask() {
    if (!newTask.trim()) return
    const task = {
      id: Date.now(),
      text: newTask,
      priority,
      completed: false,
      createdAt: new Date().toLocaleTimeString()
    }
    setTasks(t => [task, ...t])
    setNewTask('')
    onLog(`Task added: ${newTask}`)
  }

  function toggleTask(id) {
    setTasks(t => t.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  function deleteTask(id) {
    setTasks(t => t.filter(task => task.id !== id))
  }

  const pendingCount = tasks.filter(t => !t.completed).length
  const completedCount = tasks.filter(t => t.completed).length

  return (
    <div className="panel tasks-panel">
      <div className="panel-header">
        <h3>📋 Tasks & Goals</h3>
        <div className="task-stats">{pendingCount} pending • {completedCount} done</div>
      </div>
      <div className="task-form">
        <textarea 
          value={newTask} 
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), addTask())}
          placeholder="Add a task or goal..."
        />
        <div className="form-controls">
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button onClick={addTask} disabled={!newTask.trim()}>Add Task</button>
        </div>
      </div>
      <div className="task-list">
        {tasks.length === 0 && <div className="empty-state">No tasks yet. Add one above!</div>}
        {tasks.map(task => (
          <div key={task.id} className={`task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`}>
            <input 
              type="checkbox" 
              checked={task.completed} 
              onChange={() => toggleTask(task.id)}
            />
            <div className="task-content">
              <div className="task-text">{task.text}</div>
              <div className="task-meta">{task.createdAt}</div>
            </div>
            <button className="delete-btn" onClick={() => deleteTask(task.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
