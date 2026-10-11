import { useNavigate } from 'react-router-dom'

function Landing() {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>📚 Library Portal</h1>
        <p style={styles.subtitle}>Welcome! Please choose how to continue.</p>
        <div style={styles.buttons}>
          <button style={styles.btnPrimary} onClick={() => navigate('/login')}>
            User Login
          </button>
          <button style={styles.btnSecondary} onClick={() => navigate('/register')}>
            Register
          </button>
          <button style={styles.btnAdmin} onClick={() => navigate('/admin-login')}>
            Admin Login
          </button>
        </div>
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
    padding: '48px',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    fontSize: '2rem',
    marginBottom: '8px',
    color: '#1a202c'
  },
  subtitle: {
    color: '#718096',
    marginBottom: '32px'
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  btnPrimary: {
    padding: '12px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  btnSecondary: {
    padding: '12px',
    backgroundColor: '#fff',
    color: '#4f46e5',
    border: '2px solid #4f46e5',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  btnAdmin: {
    padding: '12px',
    backgroundColor: '#1a202c',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer'
  }
}

export default Landing