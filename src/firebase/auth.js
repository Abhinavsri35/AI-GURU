import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification
} from 'firebase/auth'
import { auth } from './firebaseConfig'
import { createUserDocument } from './firestore'


export const registerUser = async (name, email, password, role) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user
  await createUserDocument(user.uid, { name, email, role })
  
  await sendEmailVerification(user)
  await signOut(auth)

  return user
}


export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export const logoutUser = async () => {
  await signOut(auth)
}


export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}
