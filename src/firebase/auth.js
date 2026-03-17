// src/firebase/auth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from './firebaseConfig'
import { createUserDocument } from './firestore'

/**
 * Register a new user with email + password
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @param {'teacher'|'student'} role
 */
export const registerUser = async (name, email, password, role) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user
  // Save profile + role to Firestore
  await createUserDocument(user.uid, { name, email, role })
  return user
}

/**
 * Sign in an existing user
 */
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

/**
 * Sign out the current user
 */
export const logoutUser = async () => {
  await signOut(auth)
}

/**
 * Subscribe to auth state changes
 * @param {Function} callback
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}
