'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { AppUser } from '@/types'

interface AuthContextType {
  firebaseUser: User | null
  appUser: AppUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAppUser = async (uid: string) => {
    const ref = doc(db, 'users', uid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      setAppUser(snap.data() as AppUser)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      if (user) {
        const ref = doc(db, 'users', user.uid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setAppUser(snap.data() as AppUser)
        } else {
          const newUser: AppUser = {
            uid: user.uid,
            email: user.email!,
            displayName: user.displayName || user.email!,
            role: 'pending',
            createdAt: Timestamp.now(),
            approvedAt: null,
            readNotifications: { koinonia: [], prayer: [] },
          }
          await setDoc(ref, newUser)
          setAppUser(newUser)
        }
      } else {
        setAppUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const logout = async () => {
    await signOut(auth)
  }

  const refreshUser = async () => {
    if (firebaseUser) await fetchAppUser(firebaseUser.uid)
  }

  return (
    <AuthContext.Provider value={{ firebaseUser, appUser, loading, signInWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
