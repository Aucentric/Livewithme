const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3001
const DATA_DIR = path.join(__dirname, 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

app.use(cors())
app.use(express.json({ limit: '1mb' }))

const ensureDataFile = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({}, null, 2))
  }
}

const readUsers = () => {
  ensureDataFile()

  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8')
    return JSON.parse(raw)
  } catch {
    fs.writeFileSync(USERS_FILE, JSON.stringify({}, null, 2))
    return {}
  }
}

const writeUsers = (users) => {
  ensureDataFile()
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

const normalizeEmail = (email) => String(email || '').trim().toLowerCase()
const normalizeName = (value) => String(value || '').trim()

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.get('/api/users/:email', (req, res) => {
  const users = readUsers()
  const email = normalizeEmail(req.params.email)

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  const user = users[email]

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  res.json(user)
})

app.post('/api/users', (req, res) => {
  const users = readUsers()
  const { email, firstName } = req.body || {}
  const normalizedEmail = normalizeEmail(email)
  const normalizedName = normalizeName(firstName)

  if (!normalizedEmail || !normalizedName) {
    return res.status(400).json({ error: 'Email and first name are required' })
  }

  users[normalizedEmail] = {
    email: normalizedEmail,
    firstName: normalizedName,
    cards: users[normalizedEmail]?.cards || [],
    savedBoards: users[normalizedEmail]?.savedBoards || []
  }

  writeUsers(users)

  res.json(users[normalizedEmail])
})

app.put('/api/users/:email/cards', (req, res) => {
  const users = readUsers()
  const email = normalizeEmail(req.params.email)
  const cards = Array.isArray(req.body?.cards) ? req.body.cards : []

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  if (!users[email]) {
    users[email] = {
      email,
      firstName: req.body?.firstName || 'Friend',
      cards: [],
      savedBoards: []
    }
  }

  users[email].cards = cards
  users[email].firstName = normalizeName(req.body?.firstName || users[email].firstName || 'Friend')

  writeUsers(users)
  res.json(users[email])
})

app.put('/api/users/:email/boards', (req, res) => {
  const users = readUsers()
  const email = normalizeEmail(req.params.email)
  const boards = Array.isArray(req.body?.boards) ? req.body.boards : []

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  if (!users[email]) {
    users[email] = {
      email,
      firstName: req.body?.firstName || 'Friend',
      cards: [],
      savedBoards: []
    }
  }

  users[email].savedBoards = boards
  users[email].firstName = normalizeName(req.body?.firstName || users[email].firstName || 'Friend')

  writeUsers(users)
  res.json(users[email])
})

app.listen(PORT, () => {
  console.log(`Live with Me API running on http://localhost:${PORT}`)
})
