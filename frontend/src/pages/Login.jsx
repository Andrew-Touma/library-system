import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

function Login({ onLogin, isAdmin = false }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', username: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const endpoint = isAdmin ? '/auth/admin-login' : '/auth/login'
      const payload = isAdmin
        ? { username: formData.username, password: formData.password }
        : { email: formData.email, password: formData.password }
      const res = await api.post(endpoint, payload)
      onLogin(res.data)
      navigate(isAdmin ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>{isAdmin ? '🔐 Admin Login' : '👤 User Login'}</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} style={styles.form}>
          {isAdmin ? (
            <input
              style={styles.input}
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          ) : (
            <input
              style={styles.input}
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          )}
          <input
            style={styles.input}
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {!isAdmin && (
          <p style={styles.link}>
            No account? <Link to="/register">Register here</Link>
          </p>
        )}
        <p style={styles.link}>
          <Link to="/">← Back to home</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4f8'
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    marginBottom: '24px',
    textAlign: 'center',
    color: '#1a202c'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '1rem',
    outline: 'none'
  },
  btn: {
    padding: '12px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '8px'
  },
  error: {
    color: '#e53e3e',
    marginBottom: '12px',
    textAlign: 'center'
  },
  link: {
    textAlign: 'center',
    marginTop: '16px',
    color: '#718096'
  }
}

export default Login