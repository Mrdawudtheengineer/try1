import React, { useEffect, useRef } from 'react'

export default function EventLog({ logs }) {
  const ref = useRef()
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight }, [logs])
  return (
    <div className="panel log-panel">
      <h3>Event Log</h3>
      <div className="log" ref={ref}>
        {logs.map((l, i) => (
          <div key={i} className="log-line">[{new Date(l.ts).toLocaleTimeString()}] {l.text}</div>
        ))}
      </div>
    </div>
  )
}
