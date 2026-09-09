import React, { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './HomePage.css'
import { SavedBoard, SAVED_BOARDS_STORAGE_KEY, normalizeSavedBoards } from '../types/savedBoards'

type CardDefinition = {
  id: string
  title: string
  subtitle: string
  icon: string
  link: string
  description: string
}

const PIN = '17121996'
const protectedCardIds = new Set(['posu', 'lg', 'chill'])

const sections: CardDefinition[] = [
  {
    id: 'posu',
    title: 'Mommy',
    subtitle: 'Home brewed, heart warm',
    icon: '🥄',
    link: '/posu-corner',
    description: 'For the love that still feeds me'
  },
  {
    id: 'lg',
    title: 'G',
    subtitle: 'To my first baby',
    icon: '⭐',
    link: '/lg-corner',
    description: 'Little moments, still so dear'
  },
  {
    id: 'memory',
    title: 'Dive deep',
    subtitle: 'Memories I keep replaying',
    icon: '📷',
    link: '/memory-lane',
    description: 'The ones I never want to lose'
  },
  {
    id: 'writer',
    title: "Writer's Joint",
    subtitle: 'Words I never said aloud',
    icon: '✒️',
    link: '/writers-joint',
    description: 'Bookmarks for the heart'
  },
  {
    id: 'coffee',
    title: 'coffee coffee coffee',
    subtitle: 'caffeine — my painkiller',
    icon: '☕',
    link: '/coffee-joint',
    description: 'Slow mornings & warm thoughts'
  }
]

const escapeSections: CardDefinition[] = [
  {
    id: 'vision-board',
    title: 'Vision Board',
    subtitle: 'What I want to see',
    icon: '🪞',
    link: '/escape/vision-board',
    description: "A little space for the life I'm imagining."
  },
  {
    id: 'escape',
    title: 'Escape',
    subtitle: 'Where my mind goes',
    icon: '🌙',
    link: '/escape',
    description: 'A little place to disappear into.'
  },
  {
    id: 'little-things',
    title: 'Little Things',
    subtitle: 'Small things, big feelings',
    icon: '✨',
    link: '/little-things',
    description: 'The tiny moments worth remembering.'
  },
  {
    id: 'future-me',
    title: 'Future Me',
    subtitle: 'A letter from tomorrow',
    icon: '📜',
    link: '/future-me',
    description: "Notes to the person I'm becoming."
  }
]

const chillCard: CardDefinition = {
  id: 'chill',
  title: 'Chill with you',
  subtitle: 'Okay. Stay a little.',
  icon: '💗',
  link: '/chill-with-you',
  description: 'A little place to stay, breathe, and be soft.'
}

function HomePage() {
  const navigate = useNavigate()
  const [unlockedCards, setUnlockedCards] = useState<Record<string, boolean>>({})
  const [savedBoards, setSavedBoards] = useState<SavedBoard[]>([])
  const [hasLoadedSavedBoards, setHasLoadedSavedBoards] = useState(false)
  const [isSavedBoardsOpen, setIsSavedBoardsOpen] = useState(false)
  const [isIntroCardFlipped, setIsIntroCardFlipped] = useState(false)
  const [activeMemoryIndex, setActiveMemoryIndex] = useState(0)
  const [activeCard, setActiveCard] = useState<CardDefinition | null>(null)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)

  useEffect(() => {
    const storedUnlockedCards = sessionStorage.getItem('liveWithMeUnlockedCards')

    if (storedUnlockedCards) {
      try {
        setUnlockedCards(JSON.parse(storedUnlockedCards))
      } catch {
        sessionStorage.removeItem('liveWithMeUnlockedCards')
      }
    }

    const storedSavedBoards = localStorage.getItem(SAVED_BOARDS_STORAGE_KEY)

    if (storedSavedBoards) {
      try {
        setSavedBoards(normalizeSavedBoards(JSON.parse(storedSavedBoards)))
      } catch {
        localStorage.removeItem(SAVED_BOARDS_STORAGE_KEY)
      }
    }

    setHasLoadedSavedBoards(true)
  }, [])

  useEffect(() => {
    sessionStorage.setItem('liveWithMeUnlockedCards', JSON.stringify(unlockedCards))
  }, [unlockedCards])

  useEffect(() => {
    if (!hasLoadedSavedBoards) {
      return
    }

    localStorage.setItem(SAVED_BOARDS_STORAGE_KEY, JSON.stringify(savedBoards))
  }, [hasLoadedSavedBoards, savedBoards])

  useEffect(() => {
    if (!isSavedBoardsOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSavedBoardsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSavedBoardsOpen])

  const handleIntroCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsIntroCardFlipped(true)
    }
  }

  const handleIntroOptionClick = (option: 'explore' | 'create' | 'down' | 'chill') => {
    setIsIntroCardFlipped(false)

    if (option === 'explore') {
      return
    }

    if (option === 'create') {
      navigate('/escape/vision-board')
      return
    }

    if (option === 'down') {
      navigate('/escape')
      return
    }

    handleCardClick(chillCard)
  }

  const goToMemorySlide = (direction: 'prev' | 'next') => {
    setActiveMemoryIndex((currentIndex) => {
      if (direction === 'prev') {
        return currentIndex === 0 ? sections.length - 1 : currentIndex - 1
      }

      return currentIndex === sections.length - 1 ? 0 : currentIndex + 1
    })
  }

  const handleCardClick = (card: CardDefinition) => {
    sessionStorage.removeItem('liveWithMeSelectedSavedBoardId')

    if (!protectedCardIds.has(card.id)) {
      navigate(card.link)
      return
    }

    if (unlockedCards[card.id]) {
      navigate(card.link)
      return
    }

    setActiveCard(card)
    setPinInput('')
    setPinError('')
    setIsPinModalOpen(true)
  }

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, card: CardDefinition) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleCardClick(card)
    }
  }

  const handlePinSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!activeCard) {
      return
    }

    if (pinInput === PIN) {
      setUnlockedCards((currentCards) => ({
        ...currentCards,
        [activeCard.id]: true
      }))

      setPinInput('')
      setPinError('')
      setIsPinModalOpen(false)
      setActiveCard(null)
      navigate(activeCard.link)
      return
    }

    setPinError("That's not the right PIN. Try again.")
    setPinInput('')
  }

  const handleLogout = () => {
    sessionStorage.removeItem('liveWithMeUnlockedCards')
    localStorage.removeItem('liveWithMeUser')
    setUnlockedCards({})
    setPinInput('')
    setPinError('')
    setActiveCard(null)
    setIsPinModalOpen(false)
    navigate('/')
  }

  const closePinModal = () => {
    setIsPinModalOpen(false)
    setActiveCard(null)
    setPinInput('')
    setPinError('')
  }

  const handleOpenSavedBoard = (board: SavedBoard) => {
    sessionStorage.setItem('liveWithMeSelectedSavedBoardId', board.id)
    setIsSavedBoardsOpen(false)
    navigate('/escape/vision-board')
  }

  const handleDeleteSavedBoard = (boardId: string) => {
    const shouldDelete = window.confirm('Delete this saved board?')

    if (!shouldDelete) {
      return
    }

    setSavedBoards((currentBoards) => currentBoards.filter((board) => board.id !== boardId))

    if (sessionStorage.getItem('liveWithMeSelectedSavedBoardId') === boardId) {
      sessionStorage.removeItem('liveWithMeSelectedSavedBoardId')
    }
  }

  const formatSavedBoardDate = (createdAt: string) => {
    try {
      return new Date(createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return 'Recently'
    }
  }

  return (
    <div className="home-page fade-in">
      <header className="home-header">
        <div className="header-top">
          <button type="button" className="saved-boards-toggle" onClick={() => setIsSavedBoardsOpen(true)}>
            Saved Boards
          </button>
          <button type="button" className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="header-content">
          <h1>Live with Me</h1>
          <p className="header-subtitle">A little corner of my heart</p>
        </div>
      </header>

      <section className="home-intro">
        <div
          className={`intro-card ${isIntroCardFlipped ? 'is-flipped' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => setIsIntroCardFlipped(true)}
          onKeyDown={handleIntroCardKeyDown}
        >
          <div className="intro-card-inner">
            <div className="intro-card-front">
              <p className="intro-kicker">This is my place</p>
              <h2>For the people, moments, and feelings I hold closest.</h2>
              <p>
                Live with Me is a small space made for love, memory, and the quiet little things that shape my world.
              </p>
              <span className="intro-card-hint">click to turn</span>
            </div>

            <div className="intro-card-back">
              <p className="intro-kicker">what are you doing here?</p>

              <div className="intro-card-options">
                <button type="button" className="intro-option" onClick={(event) => {
                  event.stopPropagation()
                  handleIntroOptionClick('explore')
                }}>
                  Just Exploring
                </button>
                <button type="button" className="intro-option" onClick={(event) => {
                  event.stopPropagation()
                  handleIntroOptionClick('create')
                }}>
                  Create Boards
                </button>
                <button type="button" className="intro-option" onClick={(event) => {
                  event.stopPropagation()
                  handleIntroOptionClick('down')
                }}>
                  Feeling Down
                </button>
                <button type="button" className="intro-option" onClick={(event) => {
                  event.stopPropagation()
                  handleIntroOptionClick('chill')
                }}>
                  Chill with you
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="escape-section">
        <div className="escape-header">
          <p className="intro-kicker">a hidden drawer</p>
          <h2>ESCAPE</h2>
        </div>

        <div className="cards-grid escape-grid">
          {escapeSections.map((section) => (
            <div
              key={section.id}
              className="card-link"
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick(section)}
              onKeyDown={(event) => handleCardKeyDown(event, section)}
            >
              <div className="card">
                <div className="card-icon">{section.icon}</div>
                <h2 className="card-title">{section.title}</h2>
                <p className="card-subtitle">{section.subtitle}</p>
                <p className="card-description">{section.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider">
        <span>MEMORIES</span>
      </div>

      <div className="home-content">
        <main className="home-main">
          <div className="memory-showcase-shell">
            <div className="memory-showcase-header">
              <div>
                <p className="memory-showcase-kicker">little corners</p>
                <h2>Memories</h2>
              </div>
              <span className="memory-showcase-subtitle">the places I keep close</span>
            </div>

            <button
              type="button"
              className="memory-showcase-featured"
              onClick={() => handleCardClick(sections[activeMemoryIndex])}
            >
              <div className="memory-showcase-featured-icon">{sections[activeMemoryIndex].icon}</div>

              <div className="memory-showcase-featured-copy">
                <p className="memory-showcase-featured-label">featured corner</p>
                <h3>{sections[activeMemoryIndex].title}</h3>
                <p className="memory-showcase-featured-description">{sections[activeMemoryIndex].description}</p>
              </div>

              <span className="memory-showcase-open">Open</span>
            </button>

            <div className="memory-showcase-grid">
              {sections.map((section, index) => {
                const isProtected = protectedCardIds.has(section.id)
                const isUnlocked = !!unlockedCards[section.id]
                const isActive = activeMemoryIndex === index

                return (
                  <button
                    key={section.id}
                    type="button"
                    className={`memory-showcase-tile ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveMemoryIndex(index)}
                    aria-label={`Preview ${section.title}`}
                  >
                    <div className="memory-showcase-tile-icon">{section.icon}</div>
                    <div className="memory-showcase-tile-copy">
                      <span>{section.title}</span>
                    </div>
                    {isProtected && !isUnlocked && <span className="card-lock memory-lock">Locked</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </main>
      </div>

      {isSavedBoardsOpen && (
        <button
          type="button"
          className="saved-boards-overlay"
          aria-label="Close Saved Boards"
          onClick={() => setIsSavedBoardsOpen(false)}
        />
      )}

      <aside className={`saved-boards-sidebar ${isSavedBoardsOpen ? 'open' : ''}`} aria-hidden={!isSavedBoardsOpen}>
        <div className="saved-boards-sidebar-header">
          <h3>SAVED BOARDS</h3>
          <button type="button" className="saved-boards-sidebar-close" onClick={() => setIsSavedBoardsOpen(false)}>
            ×
          </button>
        </div>

        {savedBoards.length > 0 ? (
          <div className="saved-boards-sidebar-list">
            {savedBoards.map((board) => (
              <div key={board.id} className="saved-board-item">
                <button type="button" className="saved-board-open" onClick={() => handleOpenSavedBoard(board)}>
                  <span className="saved-board-title">{board.title}</span>
                  <span className="saved-board-date">{formatSavedBoardDate(board.createdAt)}</span>
                </button>

                <button
                  type="button"
                  className="saved-board-delete"
                  aria-label={`Delete ${board.title}`}
                  onClick={() => handleDeleteSavedBoard(board.id)}
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="saved-boards-empty-state">
            <p>No saved boards yet.</p>
            <span>Create something worth keeping.</span>
          </div>
        )}
      </aside>

      <footer className="home-footer">
        <p>Powered by Purba</p>
      </footer>

      {isPinModalOpen && activeCard && (
        <div className="pin-modal-backdrop" onClick={closePinModal}>
          <div className="pin-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="pin-modal-close" onClick={closePinModal}>
              ×
            </button>

            <p className="pin-modal-title">Enter PIN</p>

            <form onSubmit={handlePinSubmit} className="pin-form">
              <input
                type="password"
                value={pinInput}
                onChange={(event) => setPinInput(event.target.value)}
                className="pin-input"
                placeholder="PIN"
                autoFocus
              />

              {pinError && <p className="pin-error">{pinError}</p>}

              <div className="pin-actions">
                <button type="button" className="pin-cancel" onClick={closePinModal}>
                  Close
                </button>
                <button type="submit" className="pin-submit">
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage
