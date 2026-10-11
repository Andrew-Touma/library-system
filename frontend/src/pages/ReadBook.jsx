import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

function ReadBook() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [embedError, setEmbedError] = useState(false)

  useEffect(() => {
    fetchBook()
  }, [bookId])

  const fetchBook = async () => {
    try {
      const res = await api.get(`/books/${bookId}`)
      setBook(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p style={styles.center}>Loading...</p>
  if (!book) return <p style={styles.center}>Book not found.</p>

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <div>
          <h2 style={styles.title}>{book.title}</h2>
          <p style={styles.author}>by {book.author}</p>
        </div>
      </div>

      <div style={styles.readerContainer}>
        {embedError ? (
          <div style={styles.unavailable}>
            <p>📖 Full text not available for this book on Open Library.</p>
            <p style={{ color: '#718096', fontSize: '0.9rem', marginTop: '8px' }}>
              Try searching for it directly on{' '}
              
                <a href={`https://openlibrary.org/search?q=${encodeURIComponent(book.title)}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#4f46e5' }}
              >
                Open Library
              </a>
            </p>
          </div>
        ) : (
          <iframe
            title={book.title}
            src={`https://openlibrary.org/isbn/${book.isbn}`}
            style={styles.iframe}
            onError={() => setEmbedError(true)}
          />
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f0f4f8', display: 'flex', flexDirection: 'column' },
  header: {
    display: 'flex', alignItems: 'center', gap: '20px',
    padding: '16px 32px', backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  backBtn: {
    padding: '8px 16px', backgroundColor: '#e2e8f0', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap'
  },
  title: { margin: 0, color: '#1a202c', fontSize: '1.3rem' },
  author: { margin: 0, color: '#718096', fontSize: '0.9rem' },
  readerContainer: { flex: 1, padding: '24px' },
  iframe: {
    width: '100%', height: '80vh', border: 'none',
    borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
    backgroundColor: '#fff'
  },
  unavailable: {
    textAlign: 'center', padding: '60px', backgroundColor: '#fff',
    borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    color: '#4a5568', fontSize: '1.1rem'
  },
  center: { textAlign: 'center', marginTop: '40px', color: '#718096' }
}

export default ReadBook