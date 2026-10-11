import { useState, useEffect } from 'react'
import Navbar from '../components/NavBar'
import BookCard from '../components/BookCard'
import api from '../services/api'

function UserDashboard({ user, onLogout }) {
  const [books, setBooks] = useState([])
  const [currentBorrows, setCurrentBorrows] = useState([])
  const [history, setHistory] = useState([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('browse')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [requests, setRequests] = useState([])
  const [requestForm, setRequestForm] = useState({ title: '', author: '', reason: '' })
  const [showRequestForm, setShowRequestForm] = useState(false)



  useEffect(() => {
    fetchBooks()
    fetchCurrentBorrows()
  }, [])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const res = await api.get('/books')
      setBooks(res.data)
    } catch (err) {
      setError('Failed to load books')
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentBorrows = async () => {
    try {
      const res = await api.get('/current')
      setCurrentBorrows(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await api.get('/history')
      setHistory(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMyRequests = async () => {
    try {
      const res = await api.get('/requests/my')
      setRequests(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSearch = async (e) => {
    const value = e.target.value
    setSearch(value)
    if (value.trim() === '') {
      fetchBooks()
    } else {
      try {
        const res = await api.get(`/books/search?q=${value}`)
        setBooks(res.data)
      } catch (err) {
        console.error(err)
      }
    }
  }

  const showMessage = (msg) => {
    setMessage(msg)
    setTimeout(() => setMessage(null), 3000)
  }

  const showError = (msg) => {
    setError(msg)
    setTimeout(() => setError(null), 3000)
  }

  const handleBorrow = async (bookId) => {
    try {
      await api.post(`/borrow/${bookId}`)
      // fetch both at the same time and wait for both to finish
      await Promise.all([fetchBooks(), fetchCurrentBorrows()])
      if (activeTab === 'history') await fetchHistory()
      showMessage('Book borrowed successfully!')
      setActiveTab('current')
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to borrow book')
    }
  }

  const handleReturn = async (bookId) => {
    try {
      await api.post(`/return/${bookId}`)
      await Promise.all([fetchBooks(), fetchCurrentBorrows()])
      if (activeTab === 'history') await fetchHistory()
      showMessage('Book returned successfully!')
      setActiveTab('browse')
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to return book')
    }
  }

  const borrowedBookIds = currentBorrows.map(b => b.bookId?._id?.toString())

  return (
    <div style={styles.page}>
      <Navbar user={user} onLogout={onLogout} role="user" />
      <div style={styles.container}>
        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.tabs}>
          {[
            { key: 'browse', label: '🔍 Browse Books' },
            { key: 'current', label: '📖 Current Borrows' },
            { key: 'history', label: '📋 History' },
            { key: 'requests', label: '📨 My Requests' }
          ].map(tab => (
            <button
              key={tab.key}
              style={{ ...styles.tab, ...(activeTab === tab.key ? styles.activeTab : {}) }}
              onClick={() => {
                setActiveTab(tab.key)
                if (tab.key === 'history') fetchHistory()
                if (tab.key === 'current') fetchCurrentBorrows()
                if (tab.key === 'browse') fetchBooks()
                if (tab.key === 'requests') fetchMyRequests()
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'browse' && (
          <div>
            <input
              style={styles.search}
              placeholder="Search by title, author or category..."
              value={search}
              onChange={handleSearch}
            />
            {loading ? (
              <p style={styles.center}>Loading books...</p>
            ) : books.length === 0 ? (
              <p style={styles.center}>No books found.</p>
            ) : (
              <div style={styles.grid}>
                {books.map(book => (
                  <BookCard
                    key={book._id}
                    book={book}
                    onBorrow={handleBorrow}
                    onReturn={handleReturn}
                    isBorrowed={borrowedBookIds.includes(book._id?.toString())}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'current' && (
          <div>
            {currentBorrows.length === 0 ? (
              <p style={styles.center}>You have no active borrows.</p>
            ) : (
              <div style={styles.grid}>
                {currentBorrows.map(record => {
                  // find the full book object from the books array we already fetched
                  // ✅ correct — both converted to string
                  const fullBook = books.find(b => b._id?.toString() === record.bookId?._id?.toString()) || record.bookId
                  return (
                    <BookCard
                      key={record._id}
                      book={fullBook}
                      onBorrow={handleBorrow}
                      onReturn={handleReturn}
                      isBorrowed={true}
                    />
                  )
                })}

              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {history.length === 0 ? (
              <p style={styles.center}>No borrow history yet.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Book</th>
                    <th style={styles.th}>Author</th>
                    <th style={styles.th}>Borrowed</th>
                    <th style={styles.th}>Due</th>
                    <th style={styles.th}>Returned</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(record => (
                    <tr key={record._id}>
                      <td style={styles.td}>{record.bookId?.title}</td>
                      <td style={styles.td}>{record.bookId?.author}</td>
                      <td style={styles.td}>{new Date(record.borrowDate).toLocaleDateString()}</td>
                      <td style={styles.td}>{new Date(record.dueDate).toLocaleDateString()}</td>
                      <td style={styles.td}>{record.returnDate ? new Date(record.returnDate).toLocaleDateString() : '—'}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor:
                            record.status === 'returned' ? '#c6f6d5' :
                              record.status === 'late' ? '#fed7d7' : '#bee3f8',
                          color:
                            record.status === 'returned' ? '#276749' :
                              record.status === 'late' ? '#9b2c2c' : '#2b6cb0'
                        }}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {activeTab === 'requests' && (
          <div>
            <button
              style={styles.btnAdd}
              onClick={() => setShowRequestForm(!showRequestForm)}
            >
              {showRequestForm ? 'Cancel' : '+ Request a Book'}
            </button>

            {showRequestForm && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  try {
                    await api.post('/requests', requestForm)
                    setRequestForm({ title: '', author: '', reason: '' })
                    setShowRequestForm(false)
                    await fetchMyRequests()
                    showMessage('Book request submitted!')
                  } catch (err) {
                    showError(err.response?.data?.error || 'Failed to submit request')
                  }
                }}
                style={styles.form}
              >
                <h3 style={{ margin: '0 0 16px' }}>Request a Book</h3>
                <input
                  style={styles.input}
                  placeholder="Book Title"
                  value={requestForm.title}
                  onChange={e => setRequestForm({ ...requestForm, title: e.target.value })}
                  required
                />
                <input
                  style={styles.input}
                  placeholder="Author"
                  value={requestForm.author}
                  onChange={e => setRequestForm({ ...requestForm, author: e.target.value })}
                  required
                />
                <textarea
                  style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                  placeholder="Reason (optional) — why should we add this book?"
                  value={requestForm.reason}
                  onChange={e => setRequestForm({ ...requestForm, reason: e.target.value })}
                />
                <button style={styles.btnSubmit} type="submit">Submit Request</button>
              </form>
            )}

            {requests.length === 0 ? (
              <p style={styles.center}>You have no book requests yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {requests.map(req => (
                  <div key={req._id} style={styles.requestCard}>
                    <div style={styles.requestHeader}>
                      <div>
                        <h4 style={{ margin: 0, color: '#1a202c' }}>{req.title}</h4>
                        <p style={{ margin: '4px 0 0', color: '#718096', fontSize: '0.9rem' }}>
                          by {req.author}
                        </p>
                      </div>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor:
                          req.status === 'approved' ? '#c6f6d5' :
                            req.status === 'rejected' ? '#fed7d7' : '#fefcbf',
                        color:
                          req.status === 'approved' ? '#276749' :
                            req.status === 'rejected' ? '#9b2c2c' : '#744210'
                      }}>
                        {req.status}
                      </span>
                    </div>
                    {req.reason && (
                      <p style={styles.requestReason}>📝 {req.reason}</p>
                    )}
                    {req.adminNote && (
                      <p style={styles.adminNote}>💬 Admin: {req.adminNote}</p>
                    )}
                    <p style={styles.requestDate}>
                      Requested on {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px' },
  tab: {
    padding: '10px 20px', border: 'none', borderRadius: '8px',
    cursor: 'pointer', backgroundColor: '#e2e8f0', color: '#4a5568', fontSize: '0.95rem'
  },
  activeTab: { backgroundColor: '#4f46e5', color: '#fff' },
  search: {
    width: '100%', padding: '12px', borderRadius: '8px',
    border: '1px solid #e2e8f0', fontSize: '1rem',
    marginBottom: '24px', boxSizing: 'border-box'
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' },
  center: { textAlign: 'center', color: '#718096', marginTop: '40px' },
  success: {
    backgroundColor: '#c6f6d5', color: '#276749', padding: '12px',
    borderRadius: '8px', marginBottom: '16px', textAlign: 'center'
  },
  error: {
    backgroundColor: '#fed7d7', color: '#9b2c2c', padding: '12px',
    borderRadius: '8px', marginBottom: '16px', textAlign: 'center'
  },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden' },
  th: { padding: '12px 16px', backgroundColor: '#f7fafc', textAlign: 'left', color: '#4a5568', fontWeight: '600', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568' },
  statusBadge: { padding: '4px 10px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600' },
  form: {
    backgroundColor: '#fff', padding: '24px', borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '24px',
    display: 'flex', flexDirection: 'column', gap: '12px'
  },
  input: {
    padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #e2e8f0', fontSize: '0.95rem'
  },
  btnAdd: {
    padding: '10px 20px', backgroundColor: '#4f46e5', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    marginBottom: '20px', fontSize: '0.95rem'
  },
  btnSubmit: {
    padding: '10px 20px', backgroundColor: '#38a169', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem'
  },
  requestCard: {
    backgroundColor: '#fff', padding: '20px', borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
  },
  requestHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '8px'
  },
  requestReason: {
    color: '#4a5568', fontSize: '0.9rem',
    margin: '8px 0 0', fontStyle: 'italic'
  },
  adminNote: {
    color: '#4f46e5', fontSize: '0.9rem',
    margin: '8px 0 0', fontStyle: 'italic'
  },
  requestDate: {
    color: '#a0aec0', 
    fontSize: '0.8rem', 
    margin: '8px 0 0'
  }

}

export default UserDashboard;