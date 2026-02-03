import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'

const TrainingContext = createContext(null)

// Total number of training modules
const TOTAL_MODULES = 10

// Helper to get/set skipped users list
const getSkippedUsers = () => JSON.parse(localStorage.getItem('trainingSkippedUsers') || '[]')
const setSkippedUsers = (users) => localStorage.setItem('trainingSkippedUsers', JSON.stringify(users))

export function TrainingProvider({ children }) {
  const { user } = useAuth()
  const [completedVideos, setCompletedVideos] = useState([])
  const [skippedUsers, setSkippedUsersState] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load completed videos from localStorage
    const completed = JSON.parse(localStorage.getItem('completedTrainingVideos') || '[]')
    setCompletedVideos(completed)

    // Load skipped users list
    setSkippedUsersState(getSkippedUsers())
    setLoading(false)
  }, [])

  const markVideoCompleted = useCallback((videoId) => {
    setCompletedVideos(prev => {
      if (prev.includes(videoId)) return prev
      const newCompleted = [...prev, videoId]
      localStorage.setItem('completedTrainingVideos', JSON.stringify(newCompleted))
      return newCompleted
    })
  }, [])

  const isVideoCompleted = useCallback((videoId) => {
    return completedVideos.includes(videoId)
  }, [completedVideos])

  // Check if current user has skip permission
  const hasSkipPermission = user?.id ? skippedUsers.includes(user.id) : false

  // Training is complete if all modules done OR user has skip permission
  const isTrainingComplete = completedVideos.length >= TOTAL_MODULES || hasSkipPermission

  const progressPercent = Math.round((completedVideos.length / TOTAL_MODULES) * 100)

  const remainingModules = TOTAL_MODULES - completedVideos.length

  // Admin functions to manage skip permissions
  const grantSkipPermission = useCallback((userId) => {
    const current = getSkippedUsers()
    if (!current.includes(userId)) {
      const updated = [...current, userId]
      setSkippedUsers(updated)
      setSkippedUsersState(updated)
    }
  }, [])

  const revokeSkipPermission = useCallback((userId) => {
    const current = getSkippedUsers()
    const updated = current.filter(id => id !== userId)
    setSkippedUsers(updated)
    setSkippedUsersState(updated)
  }, [])

  const hasUserSkipPermission = useCallback((userId) => {
    return skippedUsers.includes(userId)
  }, [skippedUsers])

  return (
    <TrainingContext.Provider value={{
      completedVideos,
      markVideoCompleted,
      isVideoCompleted,
      isTrainingComplete,
      hasSkipPermission,
      progressPercent,
      remainingModules,
      totalModules: TOTAL_MODULES,
      loading,
      // Admin functions
      grantSkipPermission,
      revokeSkipPermission,
      hasUserSkipPermission,
    }}>
      {children}
    </TrainingContext.Provider>
  )
}

export function useTraining() {
  const context = useContext(TrainingContext)
  if (!context) {
    throw new Error('useTraining must be used within a TrainingProvider')
  }
  return context
}
