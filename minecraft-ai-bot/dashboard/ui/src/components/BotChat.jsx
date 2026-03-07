import React, { useState, useEffect, useRef } from 'react'

export default function BotChat({ socket, telemetry }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!socket) return
    const handleIncoming = (msg) => {
      let text = msg
      if (msg && typeof msg === 'object') {
        text = msg.text || ''
      }
      setMessages(m => [...m, { from: 'bot', text }])
    }
    socket.on('chat', handleIncoming)
    return () => {
      socket.off('chat', handleIncoming)
    }
  }, [socket])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!input.trim() || !socket) return
    const payload = { text: input }
    if (telemetry && telemetry.bot && telemetry.bot.id) {
      payload.botId = telemetry.bot.id
    }
    socket.emit('chat', payload)
    setMessages(m => [...m, { from: 'you', text: input }])
    setInput('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="panel bot-chat-panel">
      <h3>💬 Bot Chat</h3>
      <div className="chat-messages" style={{maxHeight: '240px', overflowY: 'auto'}}>
        {messages.map((msg, i) => (
          <div key={i} className={`message message-${msg.from}`}>
            <div className="message-avatar">{msg.from === 'you' ? '👤' : '🤖'}</div>
            <div className="message-content">
              <div className="message-text">{msg.text}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKey}
          placeholder="Type message to bot..."
        />
        <button onClick={send} disabled={!input.trim()}>Send</button>
      </div>
    </div>
  )
}
