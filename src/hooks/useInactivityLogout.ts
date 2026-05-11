import { useEffect, useRef } from 'react'

const TIMEOUT_MS = 30 * 60 * 1000 // 30 minutos
const STORAGE_KEY = 'hb_last_activity'

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']

export function useInactivityLogout(onLogout: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function resetTimer() {
    localStorage.setItem(STORAGE_KEY, Date.now().toString())
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(onLogout, TIMEOUT_MS)
  }

  useEffect(() => {
    // Check if already expired from a previous session
    const last = localStorage.getItem(STORAGE_KEY)
    if (last && Date.now() - parseInt(last) > TIMEOUT_MS) {
      onLogout()
      return
    }

    resetTimer()
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, resetTimer))
    }
  }, [])
}
