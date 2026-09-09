import React from 'react'
import { Link } from 'react-router-dom'
import './section.css'

function GCornerPage() {
  const moments = [
    { id: 1, title: 'First Smile', date: 'A precious moment' },
    { id: 2, title: 'Playtime Fun', date: 'Giggles and joy' },
    { id: 3, title: 'Learning Time', date: 'Growing up so fast' },
    { id: 4, title: 'Sleepy Time', date: 'Sweetest dreams' },
    { id: 5, title: 'Bath Time Bubbles', date: 'Splashing around' },
    { id: 6, title: 'Cuddle Time', date: 'Love is pure' }
  ]

  return (
    <div className="section-page fade-in g">
      <header className="section-header">
        <Link to="/home" className="back-button">← Back</Link>
        <p className="section-kicker">my favorite little light</p>
        <h1>G</h1>
        <p className="subtitle">To my first baby</p>
      </header>
      <main className="section-main">
        <div className="section-container">
          <div className="quote-section">
            "Growing up so beautifully, one precious moment at a time — and still, every little thing feels like love."
          </div>
          <div className="items-grid">
            {moments.map((moment) => (
              <div key={moment.id} className="item-card">
                <div className="item-icon">📷</div>
                <h4>{moment.title}</h4>
                <p>{moment.date}</p>
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

export default GCornerPage
