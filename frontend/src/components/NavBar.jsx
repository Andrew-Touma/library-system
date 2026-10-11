import { useNavigate } from 'react-router-dom'

function Navbar({ user, onLogout, role }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    if (role === 'admin') {
      navigate('/admin-login')
    } else {
      navigate('/login')
    }
  }


  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>📚 Library</h2>
      <div style={styles.right}>
        <span style={styles.username}>👋 {user?.name || user?.username}</span>
        <button style={styles.btn} onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 32px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logo: {
    margin: 0,
    color: '#4f46e5',
    fontSize: '1.4rem'
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  username: {
    color: '#4a5568',
    fontSize: '0.95rem'
  },
  btn: {
    padding: '8px 16px',
    backgroundColor: '#e53e3e',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  }
}

export default Navbar