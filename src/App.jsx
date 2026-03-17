import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import Login from './pages/Login'
import Register from './pages/Register'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentDashboard from './pages/StudentDashboard'
import GenerateTest from './pages/GenerateTest'
import TestList from './pages/TestList'
import AttemptTest from './pages/AttemptTest'
import Result from './pages/Result'
import Leaderboard from './pages/Leaderboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute role="teacher">
                <Layout><TeacherDashboard /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/generate-test"
            element={
              <ProtectedRoute role="teacher">
                <Layout><GenerateTest /></Layout>
              </ProtectedRoute>
            }
          />

      
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute role="student">
                <Layout><StudentDashboard /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/tests"
            element={
              <ProtectedRoute role="student">
                <Layout><TestList /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/test/:id"
            element={
              <ProtectedRoute role="student">
                <Layout><AttemptTest /></Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/result/:id"
            element={
              <ProtectedRoute>
                <Layout><Result /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Layout><Leaderboard /></Layout>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
