import React, { FormEvent, useEffect, useMemo, useState } from 'react'
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

type CustomCard = {
  id: string
  title: string
  description: string
  icon: string
  theme: string
  createdAt: string
  ownerEmail?: string
  ownerFirstName?: string
}

type CustomCardTheme = {
  id: string
  label: string
  className: string
  swatch: string
}

const PIN = '17121996'
const ALLOWED_CHILL_NAME = 'badal'
const CUSTOM_CARDS_STORAGE_KEY = 'customCards'
const LEGACY_CUSTOM_CARDS_STORAGE_KEY = 'liveWithMeCustomCards'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const protectedCardIds = new Set(['posu', 'lg', 'chill'])

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

const syncCustomCardsToServer = async (cards: CustomCard[]) => {
  const currentUser = getCurrentUser()

  if (!currentUser?.email) {
    return
  }

  try {
    await fetch(`${API_BASE_URL}/users/${encodeURIComponent(currentUser.email)}/cards`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: currentUser.firstName,
        cards
      })
    })
  } catch {
    // Ignore server sync failures and keep local storage as the fallback.
  }
}

const syncSavedBoardsToServer = async (boards: SavedBoard[]) => {
  const currentUser = getCurrentUser()

  if (!currentUser?.email) {
    return
  }

  try {
    await fetch(`${API_BASE_URL}/users/${encodeURIComponent(currentUser.email)}/boards`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: currentUser.firstName,
        boards
      })
    })
  } catch {
    // Ignore server sync failures and keep local storage as the fallback.
  }
}

const loadUserDataFromServer = async () => {
  const currentUser = getCurrentUser()

  if (!currentUser?.email) {
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(currentUser.email)}`)
    if (!response.ok) {
      return
    }

    const userData = await response.json()

    if (Array.isArray(userData.savedBoards)) {
      const normalizedBoards = normalizeSavedBoards(userData.savedBoards)
      setSavedBoards(normalizedBoards)
      localStorage.setItem(getUserScopedStorageKey(SAVED_BOARDS_STORAGE_KEY), JSON.stringify(normalizedBoards))
    }

    if (Array.isArray(userData.cards)) {
      const normalizedCards = normalizeCustomCards(userData.cards)
      setCustomCards(normalizedCards)
      localStorage.setItem(getUserScopedStorageKey(CUSTOM_CARDS_STORAGE_KEY), JSON.stringify(normalizedCards))
    }
  } catch {
    // Ignore failures and use local storage data as fallback.
  }
}

const CUSTOM_CARD_THEMES: CustomCardTheme[] = [
  { id: 'sage', label: 'Soft Sage', className: 'theme-sage', swatch: '#C9D5C4' },
  { id: 'blue', label: 'Dusty Blue', className: 'theme-blue', swatch: '#C6D8E7' },
  { id: 'lavender', label: 'Lavender', className: 'theme-lavender', swatch: '#D9CCE7' },
  { id: 'blush', label: 'Blush', className: 'theme-blush', swatch: '#E8C9D4' },
  { id: 'butter', label: 'Butter', className: 'theme-butter', swatch: '#E9D8B3' },
  { id: 'terracotta', label: 'Terracotta', className: 'theme-terracotta', swatch: '#D7B3A0' },
  { id: 'mist', label: 'Mist', className: 'theme-mist', swatch: '#D7D7D5' },
  { id: 'sand', label: 'Sand', className: 'theme-sand', swatch: '#E5D6BE' }
]

const CUSTOM_CARD_ICONS = ['☕', '📖', '✈️', '🎧', '🌙', '🌸', '📝', '🎞️', '♡']
const TODAY_CHOICES = [
  { id: 'good', emoji: '☀️', label: 'A good one', response: 'Keep it.' },
  { id: 'getting-there', emoji: '🌱', label: 'Getting there', response: "That's enough for today." },
  { id: 'surviving', emoji: '☕', label: 'Surviving', response: "Then let's make things a little softer." },
  { id: 'quiet', emoji: '🌙', label: 'Quiet', response: 'Quiet days count too.' },
  { id: 'escape', emoji: '🫧', label: 'I need a little escape', response: 'Come in. Stay for a while.' }
]

const defaultCustomCardDraft = {
  title: '',
  description: '',
  icon: '',
  theme: CUSTOM_CARD_THEMES[0].id
}

const normalizeCustomCards = (value: unknown): CustomCard[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === 'object')
    .map((entry) => {
      const theme = typeof entry.theme === 'string' && CUSTOM_CARD_THEMES.some((item) => item.id === entry.theme)
        ? entry.theme
        : CUSTOM_CARD_THEMES[0].id

      return {
        id: typeof entry.id === 'string' && entry.id ? entry.id : `${Date.now()}-${Math.random()}`,
        title: typeof entry.title === 'string' && entry.title ? entry.title : 'Untitled little corner',
        description: typeof entry.description === 'string' ? entry.description : '',
        icon: typeof entry.icon === 'string' ? entry.icon : '',
        theme,
        createdAt: typeof entry.createdAt === 'string' && entry.createdAt ? entry.createdAt : new Date().toISOString(),
        ownerEmail: typeof entry.ownerEmail === 'string' ? entry.ownerEmail : undefined,
        ownerFirstName: typeof entry.ownerFirstName === 'string' ? entry.ownerFirstName : undefined
      }
    })
}

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
  const [customCards, setCustomCards] = useState<CustomCard[]>([])
  const [hasLoadedSavedBoards, setHasLoadedSavedBoards] = useState(false)
  const [hasLoadedCustomCards, setHasLoadedCustomCards] = useState(false)
  const [isSavedBoardsOpen, setIsSavedBoardsOpen] = useState(false)
  const [isIntroCardFlipped, setIsIntroCardFlipped] = useState(false)
  const [activeMemoryIndex, setActiveMemoryIndex] = useState(0)
  const [activeCard, setActiveCard] = useState<CardDefinition | null>(null)
  const [customCardTitle, setCustomCardTitle] = useState('')
  const [customCardDescription, setCustomCardDescription] = useState('')
  const [customCardIcon, setCustomCardIcon] = useState('')
  const [customCardTheme, setCustomCardTheme] = useState(CUSTOM_CARD_THEMES[0].id)
  const [customCardError, setCustomCardError] = useState('')
  const [isCustomCardFormOpen, setIsCustomCardFormOpen] = useState(false)
  const [editingCustomCardId, setEditingCustomCardId] = useState<string | null>(null)
  const [customCardDeleteTarget, setCustomCardDeleteTarget] = useState<CustomCard | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [todayChoice, setTodayChoice] = useState<string | null>(null)
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

    const scopedSavedBoardsKey = getUserScopedStorageKey(SAVED_BOARDS_STORAGE_KEY)
    const scopedCustomCardsKey = getUserScopedStorageKey(CUSTOM_CARDS_STORAGE_KEY)
    const currentUser = getCurrentUser()

    const storedSavedBoards = localStorage.getItem(scopedSavedBoardsKey)

    if (storedSavedBoards) {
      try {
        setSavedBoards(normalizeSavedBoards(JSON.parse(storedSavedBoards)))
      } catch {
        localStorage.removeItem(scopedSavedBoardsKey)
      }
    } else {
      const legacyStoredSavedBoards = localStorage.getItem(SAVED_BOARDS_STORAGE_KEY)

      if (legacyStoredSavedBoards) {
        try {
          const normalizedLegacyBoards = normalizeSavedBoards(JSON.parse(legacyStoredSavedBoards))
          setSavedBoards(normalizedLegacyBoards)

          if (currentUser?.email) {
            localStorage.setItem(scopedSavedBoardsKey, JSON.stringify(normalizedLegacyBoards))
            localStorage.removeItem(SAVED_BOARDS_STORAGE_KEY)
          }
        } catch {
          localStorage.removeItem(SAVED_BOARDS_STORAGE_KEY)
        }
      }
    }

    const storedCustomCards = localStorage.getItem(scopedCustomCardsKey)

    if (storedCustomCards) {
      try {
        setCustomCards(normalizeCustomCards(JSON.parse(storedCustomCards)))
      } catch {
        localStorage.removeItem(scopedCustomCardsKey)
      }
    } else {
      const legacyStoredCustomCards = localStorage.getItem(CUSTOM_CARDS_STORAGE_KEY) ?? localStorage.getItem(LEGACY_CUSTOM_CARDS_STORAGE_KEY)

      if (legacyStoredCustomCards) {
        try {
          const normalizedLegacyCards = normalizeCustomCards(JSON.parse(legacyStoredCustomCards))
          setCustomCards(normalizedLegacyCards)

          if (currentUser?.email) {
            localStorage.setItem(scopedCustomCardsKey, JSON.stringify(normalizedLegacyCards))
            localStorage.removeItem(CUSTOM_CARDS_STORAGE_KEY)
            localStorage.removeItem(LEGACY_CUSTOM_CARDS_STORAGE_KEY)
          }
        } catch {
          localStorage.removeItem(CUSTOM_CARDS_STORAGE_KEY)
          localStorage.removeItem(LEGACY_CUSTOM_CARDS_STORAGE_KEY)
        }
      }
    }

    setHasLoadedSavedBoards(true)
    setHasLoadedCustomCards(true)
  }, [])

  useEffect(() => {
    sessionStorage.setItem('liveWithMeUnlockedCards', JSON.stringify(unlockedCards))
  }, [unlockedCards])

  useEffect(() => {
    void loadUserDataFromServer()
  }, [])

  useEffect(() => {
    if (!hasLoadedSavedBoards) {
      return
    }

    const scopedSavedBoardsKey = getUserScopedStorageKey(SAVED_BOARDS_STORAGE_KEY)
    localStorage.setItem(scopedSavedBoardsKey, JSON.stringify(savedBoards))

    if (getCurrentUser()) {
      void syncSavedBoardsToServer(savedBoards)
    }
  }, [hasLoadedSavedBoards, savedBoards])

  useEffect(() => {
    if (!hasLoadedCustomCards) {
      return
    }

    const scopedCustomCardsKey = getUserScopedStorageKey(CUSTOM_CARDS_STORAGE_KEY)
    localStorage.setItem(scopedCustomCardsKey, JSON.stringify(customCards))

    if (getCurrentUser()) {
      void syncCustomCardsToServer(customCards)
    }
  }, [customCards, hasLoadedCustomCards])

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

    const trimmedInput = pinInput.trim()

    if (activeCard.id === 'chill') {
      if (trimmedInput.toLowerCase() === ALLOWED_CHILL_NAME) {
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

      setPinError('Wrong name entered')
      setPinInput('')
      return
    }

    if (trimmedInput === PIN) {
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

  const resetCustomCardForm = () => {
    setCustomCardTitle('')
    setCustomCardDescription('')
    setCustomCardIcon('')
    setCustomCardTheme(CUSTOM_CARD_THEMES[0].id)
    setCustomCardError('')
    setEditingCustomCardId(null)
    setIsCustomCardFormOpen(false)
  }

  const handleOpenCustomCardForm = () => {
    if (customCards.length >= 10) {
      setCustomCardError("You've made enough little corners for now.")
      return
    }

    setCustomCardError('')
    setIsCustomCardFormOpen(true)
  }

  const handleEditCustomCard = (card: CustomCard) => {
    setEditingCustomCardId(card.id)
    setCustomCardTitle(card.title)
    setCustomCardDescription(card.description)
    setCustomCardIcon(card.icon)
    setCustomCardTheme(card.theme)
    setCustomCardError('')
    setIsCustomCardFormOpen(true)
  }

  const handleAddCustomCard = () => {
    const trimmedTitle = customCardTitle.trim()
    const trimmedDescription = customCardDescription.trim()

    if (!trimmedTitle || !trimmedDescription) {
      setCustomCardError('Both a title and a message are required.')
      return
    }

    if (editingCustomCardId) {
      setCustomCards((currentCards) =>
        currentCards.map((card) =>
          card.id === editingCustomCardId
            ? {
                ...card,
                title: trimmedTitle,
                description: trimmedDescription,
                icon: customCardIcon,
                theme: customCardTheme
              }
            : card
        )
      )
      resetCustomCardForm()
      return
    }

    if (customCards.length >= 10) {
      setCustomCardError("You've made enough little corners for now.")
      return
    }

    const currentUser = getCurrentUser()

    const newCard: CustomCard = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: trimmedTitle,
      description: trimmedDescription,
      icon: customCardIcon,
      theme: customCardTheme,
      createdAt: new Date().toISOString(),
      ownerEmail: currentUser?.email,
      ownerFirstName: currentUser?.firstName
    }

    setCustomCards((currentCards) => [newCard, ...currentCards])
    resetCustomCardForm()
  }

  const handleDeleteCustomCard = (cardId: string) => {
    const targetCard = customCards.find((card) => card.id === cardId)
    setCustomCardDeleteTarget(targetCard ?? null)
  }

  const confirmDeleteCustomCard = () => {
    if (!customCardDeleteTarget) {
      return
    }

    setCustomCards((currentCards) => currentCards.filter((card) => card.id !== customCardDeleteTarget.id))
    setCustomCardDeleteTarget(null)
    setCustomCardError('')
  }

  const filteredCustomCards = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return customCards
    }

    return customCards.filter((card) => {
      const searchableText = `${card.title} ${card.description} ${card.icon} ${card.theme}`.toLowerCase()
      return searchableText.includes(normalizedQuery)
    })
  }, [customCards, searchQuery])

  const filteredSavedBoards = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return savedBoards
    }

    return savedBoards.filter((board) => {
      const searchableText = `${board.title} ${board.description ?? ''} ${board.content} ${board.vision}`.toLowerCase()
      return searchableText.includes(normalizedQuery)
    })
  }, [savedBoards, searchQuery])

  const currentDateLabel = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    }).format(new Date())
  }, [])

  const todayResponse = useMemo(() => {
    return TODAY_CHOICES.find((choice) => choice.id === todayChoice)?.response ?? 'Quiet days count too.'
  }, [todayChoice])

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

      <section className="today-section" aria-label="Today">
        <div className="today-layer">
          <p className="today-label">Today</p>
          <p className="today-date">{currentDateLabel}</p>

          <div className="today-question-block">
            <p className="today-question">What kind of day are you having?</p>

            <div className="today-choice-list">
              {TODAY_CHOICES.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  className={`today-choice ${todayChoice === choice.id ? 'selected' : ''}`}
                  onClick={() => setTodayChoice(choice.id)}
                >
                  <span>{choice.emoji}</span>
                  <span>{choice.label}</span>
                </button>
              ))}
            </div>

            {todayChoice && (
              <p className="today-response">{todayResponse}</p>
            )}
          </div>
        </div>
      </section>

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
                <button type="button" className="intro-option intro-option-private" onClick={(event) => {
                  event.stopPropagation()
                  handleIntroOptionClick('chill')
                }}>
                  <span className="intro-option-private-group">
                    <span>Chill with you</span>
                    <span className="intro-option-lock" aria-label="Private">🔒</span>
                  </span>
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

      <section className="custom-card-section" aria-label="Create your own card section">
        <div className="custom-card-header">
          <p className="custom-card-kicker">make something yours</p>
          <h2>Create your Own Card</h2>
        </div>

        <div className="custom-card-panel">
          <div className="custom-card-toolbar">
            <button
              type="button"
              className="custom-card-create-button"
              onClick={handleOpenCustomCardForm}
              disabled={customCards.length >= 10}
            >
              + Create something
            </button>

            <div className="custom-card-toolbar-meta">
              <span className="custom-card-counter">{customCards.length}/10</span>
              {customCards.length >= 10 && (
                <span className="custom-card-limit-message">You've made enough little corners for now.</span>
              )}
            </div>
          </div>

          <div className="home-search">
            <span className="home-search-icon">⌕</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search your little corners..."
              aria-label="Search your little corners"
            />
          </div>

          {customCardError && <p className="custom-card-error">{customCardError}</p>}

          {filteredCustomCards.length > 0 ? (
            <div className="custom-card-grid">
              {filteredCustomCards.map((card) => {
                const theme = CUSTOM_CARD_THEMES.find((item) => item.id === card.theme) ?? CUSTOM_CARD_THEMES[0]

                return (
                  <div key={card.id} className={`custom-card-item ${theme.className}`}>
                    <div className="custom-card-top">
                      <div className="custom-card-icon-box">{card.icon || '✦'}</div>

                      <div className="custom-card-hover-actions">
                        <button type="button" className="custom-card-action" onClick={() => handleEditCustomCard(card)}>
                          Edit
                        </button>
                        <button type="button" className="custom-card-action danger" onClick={() => handleDeleteCustomCard(card.id)}>
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="custom-card-copy">
                      <h3>{card.title}</h3>
                      <p>{card.description}</p>
                    </div>

                    <div className="custom-card-footer">
                      <span className="custom-card-theme-label">{theme.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="custom-card-empty-state">
              <p>No little corners match that search yet.</p>
            </div>
          )}
        </div>
      </section>

      <div className="section-divider">
        <span>AUTHORS' MEMOIRS</span>
      </div>

      <div className="home-content">
        <main className="home-main">
          <div className="memory-showcase-shell">
            <div className="memory-showcase-header">
              <div>
                <p className="memory-showcase-kicker">little corners</p>
                <h2>Authors' Memoirs</h2>
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

        {filteredSavedBoards.length > 0 ? (
          <div className="saved-boards-sidebar-list">
            {filteredSavedBoards.map((board) => (
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

      {isCustomCardFormOpen && (
        <div className="custom-card-modal-backdrop" onClick={() => resetCustomCardForm()}>
          <div className="custom-card-modal" onClick={(event) => event.stopPropagation()}>
            <div className="custom-card-modal-header">
              <h3>{editingCustomCardId ? 'Edit your card' : '+ Create something'}</h3>
              <button type="button" className="custom-card-modal-close" onClick={resetCustomCardForm}>
                ×
              </button>
            </div>

            <div className="custom-card-modal-body">
              <label className="custom-card-field">
                <span>Title</span>
                <input
                  type="text"
                  value={customCardTitle}
                  onChange={(event) => setCustomCardTitle(event.target.value)}
                  maxLength={40}
                  placeholder="My little corner"
                />
              </label>

              <label className="custom-card-field">
                <span>Description</span>
                <textarea
                  value={customCardDescription}
                  onChange={(event) => setCustomCardDescription(event.target.value)}
                  maxLength={160}
                  placeholder="Write something personal..."
                />
              </label>

              <div className="custom-card-field">
                <span>Choose an icon</span>
                <div className="custom-card-icon-picker">
                  {CUSTOM_CARD_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`custom-card-icon-option ${customCardIcon === icon ? 'selected' : ''}`}
                      onClick={() => setCustomCardIcon(icon)}
                      aria-label={`Choose icon ${icon}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="custom-card-field">
                <span>Choose a style</span>
                <div className="custom-card-theme-grid">
                  {CUSTOM_CARD_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      className={`custom-card-theme-option ${customCardTheme === theme.id ? 'selected' : ''}`}
                      onClick={() => setCustomCardTheme(theme.id)}
                    >
                      <span className="custom-card-theme-swatch" style={{ background: theme.swatch }} />
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="custom-card-modal-actions">
              <button type="button" className="custom-card-modal-cancel" onClick={resetCustomCardForm}>
                Cancel
              </button>
              <button type="button" className="custom-card-modal-submit" onClick={handleAddCustomCard}>
                {editingCustomCardId ? 'Save Card' : 'Create Card'}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="home-footer">
        <p>Powered by Purba</p>
      </footer>

      {customCardDeleteTarget && (
        <div className="custom-card-confirm-backdrop" onClick={() => setCustomCardDeleteTarget(null)}>
          <div className="custom-card-confirm" onClick={(event) => event.stopPropagation()}>
            <p>Remove this little corner?</p>
            <div className="custom-card-confirm-actions">
              <button type="button" className="custom-card-modal-cancel" onClick={() => setCustomCardDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className="custom-card-modal-submit danger" onClick={confirmDeleteCustomCard}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {isPinModalOpen && activeCard && (
        <div className="pin-modal-backdrop" onClick={closePinModal}>
          <div className="pin-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="pin-modal-close" onClick={closePinModal}>
              ×
            </button>

            <p className="pin-modal-title">
              {activeCard.id === 'chill' ? 'Enter your name' : 'Enter PIN'}
            </p>

            <form onSubmit={handlePinSubmit} className="pin-form">
              <input
                type={activeCard.id === 'chill' ? 'text' : 'password'}
                value={pinInput}
                onChange={(event) => setPinInput(event.target.value)}
                className="pin-input"
                placeholder={activeCard.id === 'chill' ? 'Your name' : 'PIN'}
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
