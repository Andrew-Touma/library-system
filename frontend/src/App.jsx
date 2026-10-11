import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ReadBook from './pages/ReadBook'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [role, setRole] = useState(localStorage.getItem('role') || null)

  const handleLogin = (data, isAdmin = false) => {
    const userData = isAdmin ? data.admin : data.user
    setToken(data.token)
    setUser(userData)
    setRole(userData.role)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('role', userData.role)
  }

  const handleLogout = () => {
    setUser(null)
    setToken(null)
    setRole(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={
          token
            ? <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} />
            : <Login onLogin={(data) => handleLogin(data, false)} />
        } />
        <Route path="/register" element={
          token
            ? <Navigate to="/dashboard" />
            : <Register onLogin={(data) => handleLogin(data, false)} />
        } />
        <Route path="/admin-login" element={
          token
            ? <Navigate to="/admin" />
            : <Login isAdmin={true} onLogin={(data) => handleLogin(data, true)} />
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UserDashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard user={user} onLogout={handleLogout} />
          </AdminRoute>
        } />
        <Route path="/read/:bookId" element={
          <ProtectedRoute>
            <ReadBook />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App