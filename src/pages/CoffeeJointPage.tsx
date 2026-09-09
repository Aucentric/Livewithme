import React from 'react'
import { Link } from 'react-router-dom'
import './section.css'

function CoffeeJointPage() {
  const coffeeMemories = [
    { id: 1, title: 'Morning Brew', mood: 'Peaceful', time: 'Dawn' },
    { id: 2, title: 'Afternoon Pause', mood: 'Reflective', time: 'Midday' },
    { id: 3, title: 'Evening Sip', mood: 'Cozy', time: 'Sunset' },
    { id: 4, title: 'Late Night Chat', mood: 'Intimate', time: 'Night' },
    { id: 5, title: 'Rainy Day Coffee', mood: 'Contemplative', time: 'Anytime' },
    { id: 6, title: 'With Friends', mood: 'Joyful', time: 'Anytime' }
  ]

  return (
    <div className="section-page fade-in coffee">
      <header className="section-header">
        <Link to="/home" className="back-button">← Back</Link>
        <p className="section-kicker">the ritual that steadies me</p>
        <h1>coffee coffee coffee</h1>
        <p className="subtitle">caffeine — my painkiller</p>
      </header>
      <main className="section-main">
        <div className="section-container">
          <div className="quote-section">
            "Life can be so simple and good with a warm cup of coffee — and sometimes, that is exactly what keeps me going." ☕
          </div>
          <div className="items-grid">
            {coffeeMemories.map((memory) => (
              <div key={memory.id} className="item-card">
                <div className="item-icon">☕</div>
                <h4>{memory.title}</h4>
                <p>{memory.mood}</p>
                <p style={{ fontSize: '0.75rem', marginTop: 'var(--spacing-xs)' }}>{memory.time}</p>
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

export default CoffeeJointPage
