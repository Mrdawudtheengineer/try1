import React from 'react'

export default function InventoryPanel({ telemetry }) {
  if (!telemetry) return <div className="panel">Inventory: waiting</div>
  const items = telemetry.inventory || []
  return (
    <div className="panel inventory">
      <h3>Inventory</h3>
      <div className="inventory-grid">
        {Array.from({length: 36}).map((_, i) => {
          const it = items[i]
          return (
            <div key={i} className={`slot ${it ? 'filled' : ''}`}>
              {it ? (
                <>
                  <div className="item">{it.name}</div>
                  <div className="count">{it.count}</div>
                </>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
