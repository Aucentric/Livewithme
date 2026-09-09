import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './section.css'

function DiveDeepPage() {
  const memories = [
    {
      id: 1,
      title: 'Summer Vacations',
      year: '2023',
      tag: 'sun-soaked',
      description: 'Late afternoons, beach walks, and the kind of laughter that lingers.',
      icon: '🌊',
      gradient: 'linear-gradient(135deg, #e7c9b1 0%, #f5efe7 100%)'
    },
    {
      id: 2,
      title: 'Holiday Celebrations',
      year: '2023',
      tag: 'home for the heart',
      description: 'The kind of festive moments that made everything feel warm and bright.',
      icon: '✨',
      gradient: 'linear-gradient(135deg, #d9d1c2 0%, #f8f3ea 100%)'
    },
    {
      id: 3,
      title: 'Family Gatherings',
      year: '2024',
      tag: 'held close',
      description: 'Big meals, soft conversations, and the comfort of being together.',
      icon: '🏡',
      gradient: 'linear-gradient(135deg, #c7d7c0 0%, #f0f5ef 100%)'
    },
    {
      id: 4,
      title: 'Beach Days',
      year: '2024',
      tag: 'salt air',
      description: 'Sunshine, sand between our toes, and easy little joys.',
      icon: '🌞',
      gradient: 'linear-gradient(135deg, #f3d6a8 0%, #f7efe5 100%)'
    },
    {
      id: 5,
      title: 'Festival Fun',
      year: '2024',
      tag: 'color and light',
      description: 'The lively, sparkling moments that made the whole world feel brighter.',
      icon: '🎉',
      gradient: 'linear-gradient(135deg, #e9c6d8 0%, #f8f0f5 100%)'
    },
    {
      id: 6,
      title: 'Picnic Adventures',
      year: '2024',
      tag: 'easy joy',
      description: 'Blankets, snacks, and the kind of slow afternoons worth keeping.',
      icon: '🧺',
      gradient: 'linear-gradient(135deg, #d5d9b8 0%, #f4f5ee 100%)'
    },
    {
      id: 7,
      title: 'Birthday Parties',
      year: '2024',
      tag: 'celebrated',
      description: 'Sweet little milestones, cake, laughter, and too many happy memories.',
      icon: '🎂',
      gradient: 'linear-gradient(135deg, #f8d2c2 0%, #fdf0ea 100%)'
    },
    {
      id: 8,
      title: 'Movie Nights',
      year: '2024',
      tag: 'cozy',
      description: 'Soft evenings, warm snacks, and the comfort of staying close.',
      icon: '🎬',
      gradient: 'linear-gradient(135deg, #c8cadb 0%, #f0f2f8 100%)'
    }
  ]

  const [activeIndex, setActiveIndex] = useState(0)

  const activeMemory = memories[activeIndex]

  const goToPrevious = () => {
    setActiveIndex((currentIndex) => (currentIndex === 0 ? memories.length - 1 : currentIndex - 1))
  }

  const goToNext = () => {
    setActiveIndex((currentIndex) => (currentIndex === memories.length - 1 ? 0 : currentIndex + 1))
  }

  return (
    <div className="section-page fade-in memory">
      <header className="section-header">
        <Link to="/home" className="back-button">← Back</Link>
        <p className="section-kicker">the moments I replay</p>
        <h1>Dive deep</h1>
        <p className="subtitle">Memories I keep replaying</p>
      </header>

      <main className="section-main">
        <div className="section-container">
          <div className="quote-section">
            "Every moment shared is a memory cherished forever — the kind I keep returning to with a smile."
          </div>

          <div className="memory-carousel-shell">
            <div className="memory-carousel-header">
              <div>
                <p className="memory-carousel-kicker">replay</p>
                <h2>Moments worth keeping</h2>
              </div>

              <div className="memory-carousel-nav" aria-label="Memory navigation">
                <button type="button" className="memory-nav-button" onClick={goToPrevious} aria-label="Previous memory">
                  ←
                </button>
                <button type="button" className="memory-nav-button" onClick={goToNext} aria-label="Next memory">
                  →
                </button>
              </div>
            </div>

            <div className="memory-carousel-stage">
              {memories.map((memory, index) => (
                <article
                  key={memory.id}
                  className={`memory-slide ${activeIndex === index ? 'active' : ''}`}
                  style={{ background: memory.gradient }}
                >
                  <div className="memory-slide-content">
                    <div className="memory-slide-icon">{memory.icon}</div>
                    <p className="memory-slide-tag">{memory.tag}</p>
                    <h3>{memory.title}</h3>
                    <p>{memory.description}</p>
                    <span>{memory.year}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="memory-carousel-footer">
              <div className="memory-caption">
                <span className="memory-caption-label">Currently</span>
                <strong>{activeMemory.title}</strong>
              </div>

              <div className="memory-dots" aria-label="Memory slide positions">
                {memories.map((memory, index) => (
                  <button
                    key={memory.id}
                    type="button"
                    className={`memory-dot ${activeIndex === index ? 'active' : ''}`}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Show ${memory.title}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="section-footer">
        Powered by Purba
      </footer>
    </div>
  )
}

export default DiveDeepPage
