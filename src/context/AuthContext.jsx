// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthChange } from '../firebase/auth'
import { getUserDocument } from '../firebase/firestore'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user)
      if (user) {
        // Retry up to 5 times with increasing delay.
        // Needed because onAuthStateChanged fires before createUserDocument
        // finishes writing — so the document may not exist yet on first read.
        let profile = null
        for (let attempt = 0; attempt < 5; attempt++) {
          profile = await getUserDocument(user.uid)
          if (profile) break
          await new Promise((r) => setTimeout(r, 400 * (attempt + 1)))
        }
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const value = { currentUser, userProfile, loading }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
