// src/firebase/firestore.js
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebaseConfig'

// ─── Users ────────────────────────────────────────────────────────────────────

export const createUserDocument = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

export const getUserDocument = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// ─── Tests ────────────────────────────────────────────────────────────────────

export const createTest = async (testData) => {
  const ref = await addDoc(collection(db, 'tests'), {
    ...testData,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const getTestById = async (testId) => {
  const snap = await getDoc(doc(db, 'tests', testId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const getTestsByTeacher = async (teacherId) => {
  const q = query(
    collection(db, 'tests'),
    where('createdBy', '==', teacherId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const getAllPublishedTests = async () => {
  const q = query(
    collection(db, 'tests'),
    where('published', '==', true),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const updateTest = async (testId, data) => {
  await updateDoc(doc(db, 'tests', testId), data)
}

// ─── Results ──────────────────────────────────────────────────────────────────

export const saveResult = async (resultData) => {
  const ref = await addDoc(collection(db, 'results'), {
    ...resultData,
    submittedAt: serverTimestamp(),
  })
  return ref.id
}

export const getResultById = async (resultId) => {
  const snap = await getDoc(doc(db, 'results', resultId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const getResultsByStudent = async (studentId) => {
  const q = query(
    collection(db, 'results'),
    where('studentId', '==', studentId),
    orderBy('submittedAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const getResultsByTest = async (testId) => {
  const q = query(
    collection(db, 'results'),
    where('testId', '==', testId),
    orderBy('submittedAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const updateResult = async (resultId, data) => {
  await updateDoc(doc(db, 'results', resultId), data)
}

// ─── Analytics helpers ────────────────────────────────────────────────────────

export const getAnalyticsForTeacher = async (teacherId) => {
  const tests = await getTestsByTeacher(teacherId)
  const testIds = tests.map((t) => t.id)

  let allResults = []
  for (const testId of testIds) {
    const results = await getResultsByTest(testId)
    allResults = [...allResults, ...results]
  }

  return { tests, results: allResults }
}