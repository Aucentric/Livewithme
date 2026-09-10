import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './VisionBoardPage.css'
import { SavedBoard, SAVED_BOARDS_STORAGE_KEY, normalizeSavedBoards } from '../types/savedBoards'

type VisionOption = {
  id: string
  title: string
  description: string
  icon: string
  palette: string[]
}

const visionOptions: VisionOption[] = [
  {
    id: 'somewhere-far-away',
    title: 'Somewhere Far Away',
    description: 'Somewhere far away, where nobody needs anything from me.',
    icon: '🌴',
    palette: ['#7bb3c9', '#bdd8e6', '#d9c5a1', '#f2b28a']
  },
  {
    id: 'too-many-tabs-open',
    title: 'Too Many Tabs Open',
    description: "When my brain has 47 tabs open and all of them are playing music.",
    icon: '☕',
    palette: ['#8d918f', '#b7c1cb', '#a39a8a', '#f5f5dc']
  },
  {
    id: 'life-feels-good',
    title: 'Life Feels Good',
    description: 'For the days when life actually feels kind of nice.',
    icon: '☀️',
    palette: ['#f3d66d', '#f7c5a7', '#f3b8c8', '#f5f5dc']
  },
  {
    id: 'getting-there',
    title: 'Getting There',
    description: "For when I'm slowly getting there.",
    icon: '🌱',
    palette: ['#c8b8df', '#b8d8b6', '#f5f5dc', '#a8bfd7']
  },
  {
    id: 'i-need-a-reset',
    title: 'I Need a Reset',
    description: 'For when I need to disappear for a little while and come back better.',
    icon: '🫧',
    palette: ['#a8bca0', '#98a9c1', '#f5f5dc', '#d4c1df']
  }
]

const getCurrentUser = () => {
  const storedUser = localStorage.getItem('liveWithMeUser')

  if (!storedUser) {
    return null
  }

  try {
    const parsedUser = JSON.parse(storedUser)

    if (!parsedUser || typeof parsedUser.email !== 'string' || typeof parsedUser.firstName !== 'string') {
      return null
    }

    return {
      email: parsedUser.email.trim().toLowerCase(),
      firstName: parsedUser.firstName.trim()
    }
  } catch {
    return null
  }
}

const getUserScopedStorageKey = (baseKey: string) => {
  const currentUser = getCurrentUser()

  if (!currentUser?.email) {
    return baseKey
  }

  return `${baseKey}:${currentUser.email}`
}

function VisionBoardPage() {
  const [selectedVisionId, setSelectedVisionId] = useState<string>(() => {
    const storedSavedBoardId = sessionStorage.getItem('liveWithMeSelectedSavedBoardId')

    if (storedSavedBoardId) {
      const savedBoards = localStorage.getItem(SAVED_BOARDS_STORAGE_KEY)

      if (savedBoards) {
        try {
          const parsedBoards = normalizeSavedBoards(JSON.parse(savedBoards))
          const matchingBoard = parsedBoards.find((board) => board.id === storedSavedBoardId)

          if (matchingBoard) {
            return matchingBoard.vision
          }
        } catch {
          localStorage.removeItem(SAVED_BOARDS_STORAGE_KEY)
        }
      }
    }

    const storedVision = sessionStorage.getItem('liveWithMeVisionBoard')

    if (!storedVision) {
      return 'somewhere-far-away'
    }

    try {
      const parsedVision = JSON.parse(storedVision)
      return parsedVision.selectedVisionId || 'somewhere-far-away'
    } catch {
      return 'somewhere-far-away'
    }
  })

  const [visionText, setVisionText] = useState<string>(() => {
    const storedSavedBoardId = sessionStorage.getItem('liveWithMeSelectedSavedBoardId')

    if (storedSavedBoardId) {
      const savedBoards = localStorage.getItem(SAVED_BOARDS_STORAGE_KEY)

      if (savedBoards) {
        try {
          const parsedBoards = normalizeSavedBoards(JSON.parse(savedBoards))
          const matchingBoard = parsedBoards.find((board) => board.id === storedSavedBoardId)

          if (matchingBoard) {
            return matchingBoard.content
          }
        } catch {
          localStorage.removeItem(SAVED_BOARDS_STORAGE_KEY)
        }
      }
    }

    const storedVision = sessionStorage.getItem('liveWithMeVisionBoard')

    if (!storedVision) {
      return 'Today I want...'
    }

    try {
      const parsedVision = JSON.parse(storedVision)
      return parsedVision.visionText || 'Today I want...'
    } catch {
      return 'Today I want...'
    }
  })
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    if (saveMessage) {
      const timeoutId = window.setTimeout(() => setSaveMessage(''), 1800)
      return () => window.clearTimeout(timeoutId)
    }
  }, [saveMessage])

  useEffect(() => {
    const boardState = JSON.stringify({ selectedVisionId, visionText })
    sessionStorage.setItem('liveWithMeVisionBoard', boardState)
  }, [selectedVisionId, visionText])

  const selectedVision = visionOptions.find((option) => option.id === selectedVisionId) ?? visionOptions[0]

  const handleSaveVision = () => {
    const scopedSavedBoardsKey = getUserScopedStorageKey(SAVED_BOARDS_STORAGE_KEY)
    const existingBoards = normalizeSavedBoards(
      JSON.parse(localStorage.getItem(scopedSavedBoardsKey) || '[]')
    )

    const newBoard: SavedBoard = {
      id: `${selectedVision.id}-${Date.now()}`,
      title: selectedVision.title,
      vision: selectedVision.id,
      palette: selectedVision.palette,
      content: visionText,
      description: selectedVision.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedBoards = [newBoard, ...existingBoards]
    localStorage.setItem(scopedSavedBoardsKey, JSON.stringify(updatedBoards))

    setSaveMessage('Saved to your board.')
  }

  return (
    <div className="section-page fade-in vision-board-page">
      <header className="section-header">
        <Link to="/home" className="back-button">← Back</Link>
        <p className="section-kicker">private little vision</p>
        <h1>Vision Board</h1>
        <p className="subtitle">What I want to see</p>
      </header>

      <main className="section-main">
        <div className="section-container vision-board-shell">
          <div className="vision-board-panel" style={{
            '--vision-accent-1': selectedVision.palette[0],
            '--vision-accent-2': selectedVision.palette[1],
            '--vision-accent-3': selectedVision.palette[2],
            '--vision-accent-4': selectedVision.palette[3]
          } as React.CSSProperties}>
            <div className="vision-board-header">
              <div>
                <p className="vision-question">What are you escaping into today?</p>
              </div>
            </div>

            <div className="vision-options-grid">
              {visionOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`vision-option ${selectedVisionId === option.id ? 'selected' : ''}`}
                  onClick={() => setSelectedVisionId(option.id)}
                  style={{
                    background: `linear-gradient(135deg, ${option.palette[0]}, ${option.palette[1]})`
                  }}
                >
                  <span className="vision-icon">{option.icon}</span>
                  <span className="vision-option-title">{option.title}</span>
                  <span className="vision-option-description">{option.description}</span>
                </button>
              ))}
            </div>

            <div className="vision-selection-summary">
              <p className="vision-summary-label">Today I'm escaping into...</p>
              <h3>{selectedVision.title}</h3>
            </div>

            <div className="vision-palette-row">
              {selectedVision.palette.map((color, index) => (
                <span key={`${selectedVision.id}-${index}`} className="vision-color-swatch" style={{ backgroundColor: color }} />
              ))}
            </div>

            <div className="vision-board-builder">
              <label className="vision-text-label" htmlFor="vision-text">
                Today I want...
              </label>
              <textarea
                id="vision-text"
                value={visionText}
                onChange={(event) => setVisionText(event.target.value)}
                placeholder="Write what you are imagining..."
              />

              <div className="vision-board-actions">
                <button type="button" className="save-vision-button" onClick={handleSaveVision}>
                  Save Vision
                </button>
                {saveMessage && <span className="save-message">{saveMessage}</span>}
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

export default VisionBoardPage
