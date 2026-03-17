// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Register from './pages/Register'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentDashboard from './pages/StudentDashboard'
import GenerateTest from './pages/GenerateTest'
import TestList from './pages/TestList'
import AttemptTest from './pages/AttemptTest'
import Result from './pages/Result'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Teacher routes */}
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute role="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/generate-test"
            element={
              <ProtectedRoute role="teacher">
                <GenerateTest />
              </ProtectedRoute>
            }
          />

          {/* Student routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/tests"
            element={
              <ProtectedRoute role="student">
                <TestList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/test/:id"
            element={
              <ProtectedRoute role="student">
                <AttemptTest />
              </ProtectedRoute>
            }
          />

          {/* Shared result route */}
          <Route
            path="/result/:id"
            element={
              <ProtectedRoute>
                <Result />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
