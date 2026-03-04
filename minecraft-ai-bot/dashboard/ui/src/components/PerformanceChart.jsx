import React, { useEffect, useRef } from 'react'
import { Chart, LineController, LineElement, PointElement, LinearScale, TimeScale, CategoryScale } from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, TimeScale, CategoryScale)

export default function PerformanceChart({ telemetry }) {
  const canvasRef = useRef()
  const chartRef = useRef()

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: { labels: [], datasets: [
        { label: 'Ping', data: [], borderColor: '#4cc2ff', tension: 0.2 },
        { label: 'TickRate', data: [], borderColor: '#f0a', tension: 0.2 },
        { label: 'CPU (ms)', data: [], borderColor: '#0f0', tension: 0.2 }
      ]},
      options: { animation: false, scales: { x: { display: false } }, plugins: { legend: { display: true } } }
    })

    return () => { chartRef.current && chartRef.current.destroy() }
  }, [])

  useEffect(() => {
    if (!telemetry || !chartRef.current) return
    const chart = chartRef.current
    const ping = telemetry.bot ? telemetry.bot.ping || 0 : 0
    const tick = telemetry.performance ? parseFloat(telemetry.performance.tickRate) || 0 : 0
    const cpu = telemetry.performance ? (telemetry.performance.cpu.system/1000) : 0
    chart.data.labels.push(new Date().toLocaleTimeString())
    chart.data.datasets[0].data.push(ping)
    chart.data.datasets[1].data.push(tick)
    chart.data.datasets[2].data.push(cpu)
    if (chart.data.labels.length > 60) {
      chart.data.labels.shift();
      chart.data.datasets.forEach(ds=>ds.data.shift())
    }
    chart.update('none')
  }, [telemetry])

  return (
    <div className="panel">
      <h3>Performance</h3>
      <canvas ref={canvasRef} height={120}></canvas>
    </div>
  )
}
