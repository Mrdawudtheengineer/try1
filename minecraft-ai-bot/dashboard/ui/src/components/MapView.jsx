import React, { useEffect, useRef } from 'react'

export default function MapView({ telemetry }) {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const size = 300
    canvas.width = size
    canvas.height = size

    const draw = () => {
      ctx.fillStyle = '#0f1117'
      ctx.fillRect(0,0,size,size)
      if (!telemetry || !telemetry.position) return
      const centerX = size/2
      const centerY = size/2
      // draw bot
      ctx.fillStyle = '#4cc2ff'
      ctx.beginPath(); ctx.arc(centerX, centerY, 5,0,Math.PI*2); ctx.fill();

      // draw blocks (ores) as red
      if (telemetry.perception && telemetry.perception.ores) {
        telemetry.perception.ores.forEach(o => {
          const dx = o.position.x - telemetry.position.x
          const dz = o.position.z - telemetry.position.z
          const scale = 2 // blocks per pixel
          ctx.fillStyle = '#f00'
          ctx.fillRect(centerX + dx/scale, centerY + dz/scale, 2,2)
        })
      }
      // other items: players
      if (telemetry.perception && telemetry.perception.players) {
        telemetry.perception.players.forEach(p => {
          const dx = p.position.x - telemetry.position.x
          const dz = p.position.z - telemetry.position.z
          const scale = 2
          ctx.fillStyle = '#0f0'
          ctx.fillRect(centerX + dx/scale, centerY + dz/scale, 3,3)
        })
      }
    }
    draw()
  }, [telemetry])

  return (
    <div className="panel">
      <h3>World Map</h3>
      <canvas ref={canvasRef} style={{border:'1px solid #222'}}></canvas>
    </div>
  )
}
