import React from 'react'

export default function StatsPanel({ telemetry }) {
  if (!telemetry) return <div className="panel">No telemetry yet</div>
  const { stats, position, ai } = telemetry
  return (
    <div className="panel">
      <h3>Bot Statistics</h3>
      <div className="stat-row">Health: <progress value={stats.health} max={20}></progress> {stats.health}/20</div>
      <div className="stat-row">Hunger: <progress value={stats.food} max={20}></progress> {stats.food}/20</div>
      <div className="stat-row">XP Level: {stats.xp}</div>
      <div className="stat-row">Position: {position ? `${position.x}, ${position.y}, ${position.z}` : '—'}</div>
      <div className="stat-row">AI Goal: {ai && ai.currentGoal}</div>
    </div>
  )
}
