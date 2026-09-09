import React from 'react'
import { Link } from 'react-router-dom'
import './section.css'

function MommyPage() {
  const recipes = [
    {
      id: 1,
      name: 'Mom\'s Special Biryani',
      description: 'A fragrant rice dish with perfectly spiced meat',
      prepTime: '45 mins'
    },
    {
      id: 2,
      name: 'Delicious Dal Makhani',
      description: 'Creamy lentils with a buttery finish',
      prepTime: '30 mins'
    },
    {
      id: 3,
      name: 'Homemade Chutneys',
      description: 'Fresh and tangy condiments',
      prepTime: '15 mins'
    }
  ]

  return (
    <div className="section-page fade-in mommy">
      <header className="section-header">
        <Link to="/home" className="back-button">← Back</Link>
        <p className="section-kicker">my forever kitchen</p>
        <h1>Mommy</h1>
        <p className="subtitle">Home brewed, heart warm</p>
      </header>
      <main className="section-main">
        <div className="section-container">
          <div className="quote-section">
            "Every recipe tells a story of love, tradition, and warmth from the place that taught me home."
          </div>
          <div style={{ marginTop: 'var(--spacing-xl)' }}>
            {recipes.map((recipe) => (
              <div key={recipe.id} className="content-card">
                <h3>{recipe.name}</h3>
                <p>{recipe.description}</p>
                <p style={{ fontSize: '0.9rem', marginTop: 'var(--spacing-sm)' }}>
                  ⏱️ {recipe.prepTime}
                </p>
              </div>
            ))}
          </div>
          <div className="quote-section" style={{ marginTop: 'var(--spacing-2xl)' }}>
            More recipes coming soon... made with love 💕
          </div>
        </div>
      </main>
      <footer className="section-footer">
        Powered by Purba
      </footer>
    </div>
  )
}

export default MommyPage
