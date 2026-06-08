import { useEffect, useState } from 'react'
import { getElapsedMs, formatClock } from './gameLogic'

export function Timer({ match }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!match?.started_at) return

    const id = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(id)
  }, [match?.started_at])

  if (!match?.started_at) return '00:00'

  const elapsed = getElapsedMs(match, now)
  return formatClock(elapsed)
}