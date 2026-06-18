import { useState } from 'react'
import '../App.css'

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN

export function PinGate({ onUnlock }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (pin === ADMIN_PIN) {
      onUnlock()
    } else {
      setError(true)
      setPin('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pin-gate">
      <input
        type="password"
        maxLength={4}
        placeholder="PIN"
        value={pin}
        onChange={(e) => { setError(false); setPin(e.target.value) }}
      />
      {error && <p className="form-error">Incorrect PIN</p>}
      <button type="submit">Unlock</button>
    </form>
  )
}