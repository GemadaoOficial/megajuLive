import { useState, useRef, useCallback, useEffect } from 'react'

export function useLiveTimer() {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const timerRef = useRef(null)

  const start = useCallback(() => {
    if (timerRef.current) return
    setIsRunning(true)
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)
  }, [])

  const pause = useCallback(() => {
    setIsRunning(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    pause()
    setElapsedTime(0)
  }, [pause])

  const reset = useCallback(() => {
    setElapsedTime(0)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  return { elapsedTime, isRunning, start, pause, stop, reset }
}
