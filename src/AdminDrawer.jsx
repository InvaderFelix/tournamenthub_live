import { useState, useEffect } from 'react'
import { PinGate } from './lib/pinLogin.jsx'
import './App.css'

export function AdminDrawer({ open, onClose, onCreateMatch, onUpdateMatch, error, unlocked, onUnlock, currentMatch }) {
  const [mode, setMode] = useState('create')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const emptyForm = {
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
  }

  const [form, setForm] = useState(emptyForm)

  // populate form when switching to edit mode
  useEffect(() => {
    if (mode === 'edit' && currentMatch) {
      setForm({
        team_1_name: currentMatch.team_1_name || '',
        team_2_name: currentMatch.team_2_name || '',
        season_name: currentMatch.season_name || '',
        round_number: currentMatch.round_number || '',
        venue_name: currentMatch.venue_name || '',
        pitch_number: currentMatch.pitch_number || '',
        game_schedule: currentMatch.game_schedule || '',
        started_at: currentMatch.started_at || null,
        team_1_uniform_colour: currentMatch.team_1_uniform_colour || '#ff0000',
        team_2_uniform_colour: currentMatch.team_2_uniform_colour || '#0000ff',
      })
    } else if (mode === 'create') {
      setForm(emptyForm)
      setSuccess(false)
    }
  }, [mode, currentMatch])

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setSuccess(false)

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
      : form.game_schedule // in edit mode, game_schedule is already formatted text

    const payload = { ...form, game_schedule: formattedTime, started_at: null }

    if (mode === 'create') {
      await onCreateMatch?.(payload)
    } else {
      await onUpdateMatch?.(payload)
    }

    setSubmitting(false)
    setSuccess(true)
  }

  const formContent = (
    <form onSubmit={handleSubmit}>
      <div className="drawer-spacer" />

      <div className="drawer-mode-toggle">
        <button
          type="button"
          className={mode === 'create' ? 'active' : ''}
          onClick={() => { setMode('create'); setSuccess(false) }}
        >
          Create
        </button>
        <button
          type="button"
          className={mode === 'edit' ? 'active' : ''}
          onClick={() => { setMode('edit'); setSuccess(false) }}
        >
          Edit
        </button>
      </div>

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

      {mode === 'create' && (
        <label className="form-field">
          <span>Match Date and Time</span>
          <input
            type="datetime-local"
            value={form.game_schedule}
            onChange={(e) => updateField('game_schedule', e.target.value)}
          />
        </label>
      )}

      <br />
      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">
        {mode === 'create' ? 'Match created!' : 'Match updated!'}
      </p>}
      <button
        type="submit"
        disabled={submitting || success}
        className={submitting || success ? 'btn-disabled' : ''}
      >
        {submitting
          ? 'Saving...'
          : success
            ? mode === 'create' ? 'Match Created!' : 'Match Updated!'
            : mode === 'create' ? 'Create Match' : 'Update Match'
        }
      </button>
    </form>
  )

  return (
    <>
      {open && <div className="drawer-overlay" onClick={onClose} />}
      <div className={`admin-drawer ${open ? 'open' : ''}`}>
        {!unlocked
          ? <PinGate onUnlock={onUnlock} />
          : formContent
        }
      </div>
    </>
  )
}