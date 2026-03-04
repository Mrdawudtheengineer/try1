import React, { useState, useEffect } from 'react'

export default function SettingsPanel({ onLog }) {
  const [settings, setSettings] = useState({
    theme: localStorage.getItem('theme') || 'dark',
    accentColor: localStorage.getItem('accentColor') || '#00ff00',
    updateInterval: parseInt(localStorage.getItem('updateInterval') || '500'),
    logLevel: localStorage.getItem('logLevel') || 'info',
    aiTemperature: parseFloat(localStorage.getItem('aiTemperature') || '0.7'),
    aiModel: localStorage.getItem('aiModel') || 'gpt-3.5-turbo',
    autoSave: localStorage.getItem('autoSave') !== 'false',
    notificationsEnabled: localStorage.getItem('notificationsEnabled') !== 'false',
    soundEnabled: localStorage.getItem('soundEnabled') !== 'false'
  })

  useEffect(() => {
    // Apply theme
    document.documentElement.setAttribute('data-theme', settings.theme)
    document.documentElement.style.setProperty('--primary-color', settings.accentColor)
  }, [settings.theme, settings.accentColor])

  function updateSetting(key, value) {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem(key, value)
    onLog(`Setting ${key} changed to ${value}`)
  }

  function resetToDefaults() {
    const defaults = {
      theme: 'dark',
      accentColor: '#00ff00',
      updateInterval: 500,
      logLevel: 'info',
      aiTemperature: 0.7,
      aiModel: 'gpt-3.5-turbo',
      autoSave: true,
      notificationsEnabled: true,
      soundEnabled: true
    }
    Object.entries(defaults).forEach(([k, v]) => {
      localStorage.setItem(k, v)
    })
    setSettings(defaults)
    onLog('Settings reset to defaults')
  }

  function exportSettings() {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dashboard-settings-${Date.now()}.json`
    link.click()
    onLog('Settings exported')
  }

  function importSettings(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result)
        Object.entries(imported).forEach(([k, v]) => {
          updateSetting(k, v)
        })
        onLog('Settings imported successfully')
      } catch (err) {
        onLog(`Error importing settings: ${err.message}`)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="panel settings-panel">
      <div className="panel-header">
        <h3>⚙️ Settings & Customization</h3>
      </div>
      <div className="settings-grid">
        <div className="setting-group">
          <label>Theme</label>
          <select value={settings.theme} onChange={(e) => updateSetting('theme', e.target.value)}>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div className="setting-group">
          <label>Accent Color</label>
          <div className="color-picker-row">
            <input 
              type="color" 
              value={settings.accentColor} 
              onChange={(e) => updateSetting('accentColor', e.target.value)}
            />
            <input 
              type="text" 
              value={settings.accentColor} 
              onChange={(e) => updateSetting('accentColor', e.target.value)}
              placeholder="#00ff00"
            />
          </div>
        </div>

        <div className="setting-group">
          <label>Update Interval (ms)</label>
          <input 
            type="number" 
            value={settings.updateInterval} 
            onChange={(e) => updateSetting('updateInterval', parseInt(e.target.value))}
            min="100"
            max="5000"
          />
        </div>

        <div className="setting-group">
          <label>Log Level</label>
          <select value={settings.logLevel} onChange={(e) => updateSetting('logLevel', e.target.value)}>
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div className="setting-group">
          <label>AI Temperature</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1"
            value={settings.aiTemperature} 
            onChange={(e) => updateSetting('aiTemperature', parseFloat(e.target.value))}
          />
          <span>{settings.aiTemperature.toFixed(1)}</span>
        </div>

        <div className="setting-group">
          <label>AI Model</label>
          <select value={settings.aiModel} onChange={(e) => updateSetting('aiModel', e.target.value)}>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
          </select>
        </div>

        <div className="setting-group checkbox">
          <input 
            type="checkbox" 
            checked={settings.autoSave} 
            onChange={(e) => updateSetting('autoSave', e.target.checked)}
            id="autoSave"
          />
          <label htmlFor="autoSave">Auto Save</label>
        </div>

        <div className="setting-group checkbox">
          <input 
            type="checkbox" 
            checked={settings.notificationsEnabled} 
            onChange={(e) => updateSetting('notificationsEnabled', e.target.checked)}
            id="notifications"
          />
          <label htmlFor="notifications">Enable Notifications</label>
        </div>

        <div className="setting-group checkbox">
          <input 
            type="checkbox" 
            checked={settings.soundEnabled} 
            onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
            id="sound"
          />
          <label htmlFor="sound">Enable Sound</label>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn-secondary" onClick={resetToDefaults}>Reset to Defaults</button>
        <button className="btn-secondary" onClick={exportSettings}>Export Settings</button>
        <label className="btn-secondary">
          Import Settings
          <input type="file" accept=".json" onChange={importSettings} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  )
}
