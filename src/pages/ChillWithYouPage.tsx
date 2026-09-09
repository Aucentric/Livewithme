import React from 'react'
import { Link } from 'react-router-dom'
import './section.css'

function ChillWithYouPage() {
  const options = [
    { id: 1, title: 'Watch a movie', detail: 'A quiet little distraction, just for tonight.', icon: '🎬' },
    { id: 2, title: 'Listen to Spotify', detail: 'Let the music hold the room for a while.', icon: '🎵' },
    { id: 3, title: 'Makeout', detail: 'Stay close, slow down, and let the moment breathe.', icon: '💋' }
  ]

  return (
    <div className="section-page fade-in writers">
      <header className="section-header">
        <Link to="/home" className="back-button">← Back</Link>
        <p className="section-kicker">just a little longer</p>
        <h1>Chill with you</h1>
        <p className="subtitle">Okay. Stay a little.</p>
      </header>

      <main className="section-main">
        <div className="section-container">
          <div className="quote-section">
            "Okay. Stay a little. Let this be a soft place for now."
          </div>

          <div className="items-grid">
            {options.map((option) => (
              <div key={option.id} className="item-card">
                <div className="item-icon">{option.icon}</div>
                <h4>{option.title}</h4>
                <p>{option.detail}</p>
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

export default ChillWithYouPage
