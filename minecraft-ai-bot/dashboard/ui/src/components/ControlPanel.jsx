import React from 'react'

export default function ControlPanel({ apiToken, onLog }) {
  const send = async (type, data) => {
    try {
      const res = await fetch('/bot/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-token': apiToken },
        body: JSON.stringify({ type, data })
      });
      const j = await res.json();
      onLog(`Sent ${type} command: ${j.ok ? 'OK' : j.error}`);
    } catch (e) {
      onLog(`Command error: ${e.message}`);
    }
  }
  const [goto, setGoto] = React.useState('')

  return (
    <div className="panel">
      <h3>Control Panel</h3>
      <div className="button-grid">
        <button onClick={() => send('reconnect')}>Reconnect Bot</button>
        <button onClick={() => send('pause')}>Pause AI</button>
        <button onClick={() => send('resume')}>Resume AI</button>
        <button onClick={() => send('force-task', { type: 'mine', oreType: 'diamond' })}>Force Mining</button>
        <button onClick={() => send('force-task', { type: 'explore' })}>Force Exploration</button>
      </div>
      <div style={{marginTop:'8px'}}>
        <input style={{width:'60%'}} placeholder="Goto x y z" value={goto} onChange={e=>setGoto(e.target.value)} />
        <button onClick={()=>{
          const parts = goto.trim().split(/[ ,]+/).map(Number);
          if(parts.length>=3 && parts.every(n=>!isNaN(n))){
            send('force-task',{ type:'move', x:parts[0], y:parts[1], z:parts[2]});
            setGoto('');
          } else {
            onLog('Invalid goto coords');
          }
        }}>Go</button>
      </div>
    </div>
  )
}
