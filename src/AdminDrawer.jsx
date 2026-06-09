import { useState } from 'react'
// import { updateMatch, startMatch, startHalfTime, resumeMatch, finishMatch } from './lib/api'
import './App.css'

export function AdminDrawer({ open, onClose, onCreateMatch }) {
  const [form, setForm] = useState({
    team_1_name: '',
    team_2_name: '',
    season_name: '',
    round_number: '',
    venue_name: '',
    pitch_number: '',
    game_schedule: '',
    started_at: null,
  })

  function updateField(field, value) {
    setForm(prev => ({...prev, [field]: value,}))
  }

  function handleSubmit(e) {
    e.preventDefault()

    onCreateMatch?.({...form, started_at: form.started_at || null })
  }

  return (
    <>
    {open && <div className="drawer-overlay" onClick={onClose} />}
    <div className={`admin-drawer ${open ? 'open' : ''}`}>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Home Team"
            value={form.team_1_name}
            onChange={(e) => updateField('team_1_name', e.target.value)}
          />
          <input
            placeholder="Away Team"
            value={form.team_2_name}
            onChange={(e) => updateField('team_2_name', e.target.value)}
          />
          <input
            placeholder="Season Name"
            value={form.season_name}
            onChange={(e) => updateField('season_name', e.target.value)}
          />
          <input
            placeholder="Round Number"
            value={form.round_number}
            onChange={(e) => updateField('round_number', e.target.value)}
          />
          <input
            placeholder="Venue"
            value={form.venue_name}
            onChange={(e) => updateField('venue_name', e.target.value)}
          />
          <input
            placeholder="Pitch Number"
            value={form.pitch_number}
            onChange={(e) => updateField('pitch_number', e.target.value)}
          />
          <input
            placeholder="Date and Time"
            value={form.game_schedule}
            onChange={(e) => updateField('game_schedule', e.target.value)}
          />
          <input
            placeholder="Started at (optional)"
            value={form.started_at || ''}
            onChange={(e) => updateField('started_at', e.target.value)}
          />
          <button type="submit">
            Create match
          </button>
        </form>
    </div>
    </>
  )
}   