import React from 'react'

export default function AIPanel({ telemetry }) {
  if (!telemetry) return <div className="panel">AI: waiting for data</div>
  const { ai } = telemetry
  return (
    <div className="panel">
      <h3>AI Decision Panel</h3>
      <div>Current Goal: {ai.currentGoal}</div>
      <div>Target Block: {ai.targetBlock || '—'}</div>
      <div>Confidence: {Math.round((ai.confidence||0)*100)}%</div>
      <div>Last Decision: {telemetry.timestamp ? new Date(telemetry.timestamp).toLocaleTimeString() : '—'}</div>
    </div>
  )
}
