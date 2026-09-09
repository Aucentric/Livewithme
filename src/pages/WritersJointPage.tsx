import React from 'react'
import { Link } from 'react-router-dom'
import './section.css'

function WritersJointPage() {
  const pieces = [
    { id: 1, title: 'A Quiet Morning', type: 'Poem', date: 'January 2024' },
    { id: 2, title: 'Whispers of the Heart', type: 'Story', date: 'December 2023' },
    { id: 3, title: 'Moonlit Dreams', type: 'Poem', date: 'November 2023' },
    { id: 4, title: 'The Journey Within', type: 'Story', date: 'October 2023' },
    { id: 5, title: 'Dance of Thoughts', type: 'Poem', date: 'September 2023' },
    { id: 6, title: 'Finding Home', type: 'Story', date: 'August 2023' }
  ]

  return (
    <div className="section-page fade-in writers">
      <header className="section-header">
        <Link to="/home" className="back-button">← Back</Link>
        <p className="section-kicker">thoughts I keep tucked away</p>
        <h1>Writer's Joint</h1>
        <p className="subtitle">Bookmarks for the heart</p>
      </header>
      <main className="section-main">
        <div className="section-container">
          <div className="quote-section">
            "Words flow from the soul and touch the heart — these are the little pieces I wanted to keep close."
          </div>
          <div style={{ marginTop: 'var(--spacing-xl)' }}>
            {pieces.map((piece) => (
              <div key={piece.id} className="content-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-xs)' }}>
                  <h3>{piece.title}</h3>
                  <span style={{ background: 'var(--accent-primary)', color: 'var(--text-primary)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '500', whiteSpace: 'nowrap', marginLeft: 'var(--spacing-sm)' }}>
                    {piece.type}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', margin: 0 }}>{piece.date}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <footer className="section-footer">
        Powered by Purba
      </footer>
    </div>
  )
}

export default WritersJointPage
