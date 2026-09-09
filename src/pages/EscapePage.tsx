import React from 'react'
import { Link } from 'react-router-dom'
import './section.css'

function EscapePage() {
  const entries = [
    { id: 1, title: 'Dreams', detail: 'The places I want to go someday.' },
    { id: 2, title: 'Feelings', detail: 'The emotions I want to hold gently.' },
    { id: 3, title: 'Memories', detail: 'The little worlds I want to revisit.' },
    { id: 4, title: 'Stillness', detail: 'The quiet moments I want to keep.' }
  ]

  return (
    <div className="section-page fade-in writers">
      <header className="section-header">
        <Link to="/home" className="back-button">← Back</Link>
        <p className="section-kicker">a private little corner</p>
        <h1>Escape</h1>
        <p className="subtitle">Where my mind goes</p>
      </header>

      <main className="section-main">
        <div className="section-container">
          <div className="quote-section">
            "A place to disappear into for a while, and come back a little softer."
          </div>

          <div className="items-grid">
            {entries.map((entry) => (
              <div key={entry.id} className="item-card">
                <div className="item-icon">🌿</div>
                <h4>{entry.title}</h4>
                <p>{entry.detail}</p>
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

export default EscapePage
