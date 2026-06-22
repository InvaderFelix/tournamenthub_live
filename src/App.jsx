import './App.css'
import { useEffect, useState } from 'react'

import { Timer } from './lib/Timer'
import { MatchSelector } from './MatchSelector'
import { AdminDrawer } from './AdminDrawer'
import { fetchMatch, fetchGoals, fetchParticipants, subscribeToUpdates, createMatch, updateMatch, checkMatchExists } from './lib/api'
import { computeScore, formatLatestGoal } from './lib/gameLogic'


// placeholder match data
const initialMatch = {
  id: null,
  team_1_name: 'Hometown United FC',
  team_2_name: 'Away City Rangers',
  game_status: 'Pending',
  started_at: null, // default null, use Date.now() to test
  season_name: 'Season Name',
  round_number: '1',
  venue_name: 'Venue Stadium',
  pitch_number: '2',
  game_schedule: 'Thursday, 17 September 2026 at 12:45 pm',
  half_time_started_at: null,
  team_1_uniform_colour: '#FF0000',
  team_2_uniform_colour: '#0000FF',
}


// main React component
function App() {
  const [matchId, setMatchId] = useState('')
    // hardcoded matchID(s) above used only for testing, replace with ''
  const [match, setMatch] = useState(initialMatch) // refer to object shape above
  const [goals, setGoals] = useState([])
  const [participants, setParticipants] = useState([])
  const [mode, setMode] = useState('dark')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [view, setView] = useState('selector') // initial states: 'selector' | 'scoreboard'
  const [createError, setCreateError] = useState(null)
  const [theme, setTheme] = useState('stadium')
  const themes = [
    { value: 'broadcast', label: 'ESPN' },
    { value: 'premium',   label: 'Prem' },
    { value: 'cyber',     label: 'Cyber' },
    { value: 'stadium',   label: 'Elite' },
  ]

// theme toggle
useEffect(() => {
  document.documentElement.dataset.theme = theme
  document.documentElement.dataset.mode = mode
}, [theme, mode])

// data fetching on mount + cleanup
useEffect(() => {
  if (!matchId) return

  let isMounted = true
  async function loadInitialData() {
    const [matchData, goalsData, participantsData] = await Promise.all([
      fetchMatch(matchId),
      fetchGoals(matchId),
      fetchParticipants(matchId),
    ])

    if (!isMounted) return
    // acceptable because lifecycle is single-mount with no re-entry
    // replace if matchId can change, component can remount frequently,
    // or if concurrent fetches exist! // AM

    if (matchData) {
      setMatch(matchData)
    }

    setGoals(goalsData)
    setParticipants(participantsData)
  }

  loadInitialData()

  const unsubscribe = subscribeToUpdates(matchId,
    async () => {
      const goalsData = await fetchGoals(matchId)
      if (isMounted) setGoals(goalsData)
    },
    (payload) => {
      if (payload.new) {
        setMatch(prev => ({ ...prev, ...payload.new }))
      }
    }
  )
  return () => {
    isMounted = false
    unsubscribe?.()
  }
}, [matchId])

// handle form submission from adminDrawer
async function handleCreateMatch(formData) {
  setCreateError(null)

  const exists = await checkMatchExists(
    formData.team_1_name,
    formData.team_2_name,
    formData.game_schedule
  )

  if (exists) {
    setCreateError('A match with these teams and date already exists.')
    return
  }

  const newMatch = await createMatch(formData)
  if (newMatch) {
    setMatch(newMatch)
    setMatchId(newMatch.id)
  } else {
    setCreateError('Failed to create match. Please try again.')
  }
}

async function handleUpdateMatch(formData) {
  setCreateError(null)
  const { data, error } = await updateMatch(matchId, formData)
  if (data) {
    setMatch(data)
  } else {
    setCreateError(error?.message || 'Failed to update match.')
  }
}

const score = computeScore(goals)
// const latestGoal = formatLatestGoal(goals, match) // add with "last goal" marquee
const team1Players = participants.filter((player) => player.team === 'team1')
const team2Players = participants.filter((player) => player.team === 'team2')

if (view === 'selector') {
  return <MatchSelector onSelectMatch={(id) => { setMatchId(id); setView('scoreboard') }} />
}

  return (
    <main className="app-container">

      <div className="topbar">
        <div className="theme-controls">
          <div className="theme-switcher">
            {themes.map(t => (
              <button
                key={t.value}
                type="button"
                className={`theme-btn ${theme === t.value ? 'active' : ''}`}
                onClick={() => setTheme(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
          
          <button
            type="button"
            className={`switch ${mode === 'dark' ? 'on' : ''}`}
            onClick={() => setMode(m => m === 'dark' ? 'light' : 'dark')}
            role="switch"
          >
            <span className="switch-track">
              <span className="switch-thumb" />
            </span>
            <span className="switch-label">
              {mode === 'dark' ? 'Dark' : 'Light'}
            </span>
          </button>
        </div>

        <AdminDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onCreateMatch={handleCreateMatch}
          onUpdateMatch={handleUpdateMatch}
          error={createError}
          unlocked={unlocked}
          onUnlock={() => setUnlocked(true)}
          currentMatch={match}
        />

        <div className='topbar-right'>
          <button
              type="button"
              className="back-btn"
              onClick={() => setView('selector')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 14L4 9l5-5" />
                <path d="M4 9h10a6 6 0 0 1 0 12h-1" />
              </svg>
          </button>

          <button
            type="button"
            className="hamburger-btn"
              onClick={() => {
              if (unlocked) {
                setDrawerOpen(open => !open)
              } else {
                setDrawerOpen(open => !open)
              }
            }}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <section className="scoreboard">
        <div className="scoreboard-panel">
          <div className="team">{/*<span className="team-suburb">{match.team_1_suburb}</span>*/}{match.team_1_name}</div>
          <div className="timer">
            {match.started_at ? (
              <Timer match={match} />
            ) : ( '00:00' )}

          </div>
          <div className="team">{/*<span className="team-suburb">{match.team_2_suburb}</span>*/}{match.team_2_name}</div>
          <div className="score">{score.team1}</div>
          <div className="status">{match.game_status}</div>
          <div className="score">{score.team2}</div>
        </div>
      </section>

      <section className="game-info">
        <div className="game-info-row cols-2">
          <p className="text-left">{match.season_name}</p>
          <p className="text-right">Round {match.round_number}</p>
        </div>

        <div className="game-info-row cols-2">
          <p className="text-left">{match.venue_name}</p>
          <p className="text-right">Pitch {match.pitch_number}</p>
        </div>
      </section>

      <h3 className="section-title">Goal Summary</h3>
      <section className="goal-summary">
        <div className="goal-summary-panel">

          <div className="goal-summary-text-column text-left">
            Placeholder<br />
            (1'01")<br />
            (2'01")<br />
            (3'01")<br />
          </div>

          <div className="goal-summary-text-column text-left">
              {/* {goals.map((goal) => ( */}
              Placeholder<br />
              #5 Mia H<br />
              #10 Zara Q<br />
              #42 Poppy R<br />
          </div>

          <div className="goal-summary-text-column text-right">
              {/* {goals.map((goal) => ( */}
              Placeholder<br />
              Zoe V #6<br />
              Jane D #9<br />
              Kat G #67<br />
          </div>

          <div className="goal-summary-text-column text-right">
            Placeholder<br />
            (1'00")<br />
            (2'00")<br />
            (3'00")<br />
          </div>

        </div>
      </section>

      <h3 className="section-title">Participating Players</h3>
      <div className="players-section-header">
        
        <div>
            <svg className="jersey-icon" viewBox="0 0 64 64" style={{ fill: match.team_2_uniform_colour }}>
              <path d="M20 4 L8 14 L14 24 L20 20 L20 56 L44 56 L44 20 L50 24 L56 14 L44 4 L38 4 C38 8 34 10 32 10 C30 10 26 8 26 4 Z" />
            </svg>
        </div>
        
        <div>
        Placeholder<br />
        11 Starting<br />
        4 Substitutes
        </div>

        <div>
        Placeholder<br />
        11 Starting<br />
        3 Substitutes
        </div>

        <div>
          <svg className="jersey-icon" viewBox="0 0 64 64" style={{ fill: match.team_1_uniform_colour }}>
            <path d="M20 4 L8 14 L14 24 L20 20 L20 56 L44 56 L44 20 L50 24 L56 14 L44 4 L38 4 C38 8 34 10 32 10 C30 10 26 8 26 4 Z" />
          </svg>
        </div>

        </div>

      <section className="players-section">
        <div className="players-section-panel">
            <div className="text-left">
              Placeholder<br />
              #5 Mia H<br />
              #10 Zara Q<br />
              #42 Poppy R<br />
            </div>
        </div>

        <div className="players-section-panel">
          <div className="text-right">
            Placeholder<br />
            Zoe V #6<br />
            Jane D #9<br />
            Katarina G #67<br />
          </div>
        </div>
      </section>

      <div className='footer'>
        {match.game_schedule}
        {/* {match.id} */}
      </div>
    </main>
  )
}

export default App