import React, { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'

export default function AIChat({ apiToken, onLog }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiName, setAiName] = useState('Dawud')
  const [aiPersonality, setAiPersonality] = useState('helpful')
  const [temperature, setTemperature] = useState(0.7)
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io({ auth: { token: apiToken } })
      
      socketRef.current.on('ai-response', (data) => {
        setMessages(m => [...m, { role: 'assistant', content: data.message, timestamp: Date.now() }])
        setLoading(false)
      })

      socketRef.current.on('ai-error', (data) => {
        setMessages(m => [...m, { role: 'assistant', content: `Error: ${data.error}`, timestamp: Date.now() }])
        setLoading(false)
      })
    }
    return () => {
      if (socketRef.current) socketRef.current.off('ai-response')
    }
  }, [apiToken])

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    setLoading(true)
    setMessages(m => [...m, { role: 'user', content: userMsg, timestamp: Date.now() }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          aiName,
          personality: aiPersonality,
          temperature,
          history: messages.slice(-5) // include last 5 messages for context
        })
      })

      const data = await response.json()
      if (data.success) {
        setMessages(m => [...m, { role: 'assistant', content: data.message, timestamp: Date.now() }])
        onLog(`AI (${aiName}): ${data.message}`)
        
        // if it's a command, execute it
        if (data.isCommand && socketRef.current) {
          socketRef.current.emit('dashboard-command', {
            type: data.commandType,
            data: data.commandData
          })
        }
      } else {
        setMessages(m => [...m, { role: 'assistant', content: `Error: ${data.error}`, timestamp: Date.now() }])
      }
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', content: `Error: ${err.message}`, timestamp: Date.now() }])
      onLog(`AI Chat error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="panel ai-chat-panel">
      <div className="panel-header">
        <h3>💬 AI Chat</h3>
        <div className="ai-controls">
          <label>Name: <input type="text" value={aiName} onChange={(e) => setAiName(e.target.value)} maxLength="20" /></label>
          <label>Personality: <select value={aiPersonality} onChange={(e) => setAiPersonality(e.target.value)}>
            <option value="helpful">Helpful</option>
            <option value="aggressive">Aggressive</option>
            <option value="cautious">Cautious</option>
            <option value="funny">Funny</option>
          </select></label>
          <label>Temp: <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} /></label>
        </div>
      </div>
      <div className="chat-messages">
        {messages.length === 0 && <div className="chat-welcome">Start a conversation with {aiName}!</div>}
        {messages.map((msg, i) => (
          <div key={i} className={`message message-${msg.role}`}>
            <div className="message-avatar">{msg.role === 'user' ? '👤' : '🤖'}</div>
            <div className="message-content">
              <div className="message-text">{msg.content}</div>
              <div className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
        {loading && <div className="message message-assistant"><div className="message-avatar">🤖</div><div className="typing">Thinking...</div></div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything or tell me what to do..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>{loading ? 'Thinking...' : 'Send'}</button>
      </div>
    </div>
  )
}
