import { useState } from 'react'
// import { updateMatch, startMatch, startHalfTime, resumeMatch, finishMatch } from './lib/api'
import './App.css'

export function AdminDrawer({ open, onClose, onCreateMatch, error }) {
  const [form, setForm] = useState({
    team_1_name: '',
    team_2_name: '',
    season_name: '',
    round_number: '',
    venue_name: '',
    pitch_number: '',
    game_schedule: '',
    started_at: null,
    team_1_uniform_colour: '#ff0000',
    team_2_uniform_colour: '#0000ff',
  })

  function updateField(field, value) {
    setForm(prev => ({...prev, [field]: value,}))
  }

  function handleSubmit(e) {
    e.preventDefault()

    // format game_schedule into text display string
    const formattedTime = form.game_schedule
      ? new Date(form.game_schedule).toLocaleString('en-AU', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      : ''

    onCreateMatch?.({...form, game_schedule: formattedTime, started_at: null })
  }

  return (
    <>
    {open && <div className="drawer-overlay" onClick={onClose} />}
    <div className={`admin-drawer ${open ? 'open' : ''}`}>
        <form onSubmit={handleSubmit}>
          <div className="drawer-spacer" />

          <label className="form-field">
            <span>Home Team</span>
            <input
              placeholder="Left scoreboard display"
              value={form.team_1_name}
              onChange={(e) => updateField('team_1_name', e.target.value)}
            />
          </label>

          <div className="half-widths uniform-colours">
            <label className="form-field">
              <span>Home Uniform Colour</span>
              <input
                type="color"
                value={form.team_1_uniform_colour || '#ff0000'}
                onChange={(e) => updateField('team_1_uniform_colour', e.target.value)}
              />
            </label>

            <label className="form-field">
              <span>Away Uniform Colour</span>
              <input
                type="color"
                value={form.team_2_uniform_colour || '#0000ff'}
                onChange={(e) => updateField('team_2_uniform_colour', e.target.value)}
              />
            </label>
          </div>

          <label className="form-field">
            <span>Away Team</span>
            <input
              placeholder="Right scoreboard display"
              value={form.team_2_name}
              onChange={(e) => updateField('team_2_name', e.target.value)}
            />
          </label>

          <label className="form-field">
            <span>Season Name</span>
            <input
              placeholder="e.g. Winter / Summer 2026"
              value={form.season_name}
              onChange={(e) => updateField('season_name', e.target.value)}
            />
          </label>

          <div className="half-widths round-pitch">
            <label className="form-field">
              <span>Round Number</span>
              <input
                type="number"
                placeholder="e.g. 1, 2, 3..."
                value={form.round_number}
                onChange={(e) => updateField('round_number', e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Pitch Number</span>
              <input
                type="number"
                placeholder="e.g. 1, 2, 3..."
                value={form.pitch_number}
                onChange={(e) => updateField('pitch_number', e.target.value)}
              />
            </label>
          </div>

          <label className="form-field">
            <span>Venue</span>
            <input
              placeholder="e.g. Central Park Sports Complex"
              value={form.venue_name}
              onChange={(e) => updateField('venue_name', e.target.value)}
            />
          </label>



          <label className="form-field">
            <span>Match Date and Time</span>
            <input
              type="datetime-local"
              placeholder="e.g. 1st June 2026, 2:30pm"
              value={form.game_schedule}
              onChange={(e) => updateField('game_schedule', e.target.value)}
            />
          </label>

          <br />
          {error && <p className="form-error">{error}</p>}
          <button type="submit">Create match</button>
        </form>
    </div>
    </>
  )
}   