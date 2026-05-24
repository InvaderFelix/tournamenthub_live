import { useState } from 'react'
import { updateMatch } from './lib/api'
import './App.css'

export function AdminDrawer({ match, goals, isOpen, onClose }) {
  const [team1Name, setTeam1Name] = useState(match.team1_name)
  const [team2Name, setTeam2Name] = useState(match.team2_name)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateMatch({ team1_name: team1Name, team2_name: team2Name })
      // The update will come through realtime
    } catch (error) {
      alert('Failed to update teams: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className={`admin-drawer ${isOpen ? 'open' : ''}`}>
        <div className="admin-header">
          <h2>Admin Panel</h2>
          <button type="button" onClick={onClose}>Close</button>
        </div>
        <div className="admin-section">
          <div className="form-group">
            <label>Home Team Name</label>
            <input
              type="text"
              value={team1Name}
              onChange={(e) => setTeam1Name(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Away Team Name</label>
            <input
              type="text"
              value={team2Name}
              onChange={(e) => setTeam2Name(e.target.value)}
            />
          </div>
          <button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Teams'}
          </button>
          <div className="meta-line">Status: {match.status}</div>
          <div className="meta-line">Goals: {goals.length}</div>
        </div>
      </div>
      {isOpen ? <button type="button" className="backdrop" onClick={onClose} /> : null}
    </>
  )
}