const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

const app = express()
const PORT = process.env.PORT || 3001
const DATABASE_URL = process.env.DATABASE_URL || null
const DATA_DIR = path.join(__dirname, 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

app.use(cors())
app.use(express.json({ limit: '1mb' }))

let pgClient = null
let legacyMigratedToDb = false
let storageMode = DATABASE_URL ? 'postgres' : 'file'

const normalizeEmail = (email) => String(email || '').trim().toLowerCase()
const normalizeName = (value) => String(value || '').trim()

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

const serializeUserRecord = (row) => ({
  email: row.email,
  firstName: row.first_name || '',
  cards: Array.isArray(row.cards) ? row.cards : [],
  savedBoards: Array.isArray(row.saved_boards) ? row.saved_boards : []
})

const getLegacyUsers = () => {
  const users = readUsers()
  return users && typeof users === 'object' ? users : {}
}

const getPgClient = async () => {
  if (!DATABASE_URL) {
    return null
  }

  if (pgClient) {
    return pgClient
  }

  try {
    pgClient = new Client({
      connectionString: DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })

    await pgClient.connect()

    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        cards JSONB NOT NULL DEFAULT '[]'::jsonb,
        saved_boards JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    storageMode = 'postgres'
    return pgClient
  } catch (error) {
    console.error('Database initialization failed:', error.message)
    pgClient = null
    storageMode = 'file'
    return null
  }
}

const migrateLegacyUsersToDb = async () => {
  if (!DATABASE_URL || legacyMigratedToDb) {
    return
  }

  const client = await getPgClient()

  if (!client) {
    return
  }

  const legacyUsers = getLegacyUsers()

  for (const [email, user] of Object.entries(legacyUsers)) {
    const normalizedEmail = normalizeEmail(email)
    const normalizedName = normalizeName(user?.firstName)

    if (!normalizedEmail || !normalizedName) {
      continue
    }

    await client.query(
      `
        INSERT INTO users (email, first_name, cards, saved_boards)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email)
        DO UPDATE SET
          first_name = EXCLUDED.first_name,
          cards = EXCLUDED.cards,
          saved_boards = EXCLUDED.saved_boards
      `,
      [
        normalizedEmail,
        normalizedName,
        Array.isArray(user?.cards) ? user.cards : [],
        Array.isArray(user?.savedBoards) ? user.savedBoards : []
      ]
    )
  }

  legacyMigratedToDb = true
}

const getUserFromStore = async (email) => {
  const client = await getPgClient()

  if (client) {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email])

    if (result.rowCount > 0) {
      return serializeUserRecord(result.rows[0])
    }
  }

  const users = getLegacyUsers()
  return users[email] || null
}

const upsertUserInStore = async ({ email, firstName, cards, savedBoards }) => {
  const normalizedEmail = normalizeEmail(email)
  const normalizedName = normalizeName(firstName)

  if (!normalizedEmail || !normalizedName) {
    return null
  }

  const client = await getPgClient()

  if (client) {
    const result = await client.query(
      `
        INSERT INTO users (email, first_name, cards, saved_boards)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email)
        DO UPDATE SET
          first_name = EXCLUDED.first_name,
          cards = EXCLUDED.cards,
          saved_boards = EXCLUDED.saved_boards
      `,
      [
        normalizedEmail,
        normalizedName,
        Array.isArray(cards) ? cards : [],
        Array.isArray(savedBoards) ? savedBoards : []
      ]
    )

    return {
      email: normalizedEmail,
      firstName: normalizedName,
      cards: Array.isArray(cards) ? cards : [],
      savedBoards: Array.isArray(savedBoards) ? savedBoards : []
    }
  }

  const users = getLegacyUsers()

  users[normalizedEmail] = {
    email: normalizedEmail,
    firstName: normalizedName,
    cards: Array.isArray(cards) ? cards : [],
    savedBoards: Array.isArray(savedBoards) ? savedBoards : []
  }

  writeUsers(users)

  return users[normalizedEmail]
}

app.get('/api/health', async (req, res) => {
  await getPgClient()
  await migrateLegacyUsersToDb()

  res.json({ ok: true, storage: storageMode })
})

app.get('/api/users/:email', async (req, res) => {
  const email = normalizeEmail(req.params.email)

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  await getPgClient()
  await migrateLegacyUsersToDb()

  const user = await getUserFromStore(email)

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  res.json(user)
})

app.post('/api/users', async (req, res) => {
  const { email, firstName } = req.body || {}
  const normalizedEmail = normalizeEmail(email)
  const normalizedName = normalizeName(firstName)

  if (!normalizedEmail || !normalizedName) {
    return res.status(400).json({ error: 'Email and first name are required' })
  }

  await getPgClient()
  await migrateLegacyUsersToDb()

  const existingUser = await getUserFromStore(normalizedEmail)

  const savedUser = await upsertUserInStore({
    email: normalizedEmail,
    firstName: normalizedName,
    cards: existingUser?.cards || [],
    savedBoards: existingUser?.savedBoards || []
  })

  if (!savedUser) {
    return res.status(400).json({ error: 'Unable to save user' })
  }

  res.json(savedUser)
})

app.put('/api/users/:email/cards', async (req, res) => {
  const email = normalizeEmail(req.params.email)
  const cards = Array.isArray(req.body?.cards) ? req.body.cards : []

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  await getPgClient()
  await migrateLegacyUsersToDb()

  const existingUser = await getUserFromStore(email)

  const savedUser = await upsertUserInStore({
    email,
    firstName: normalizeName(req.body?.firstName || existingUser?.firstName || 'Friend'),
    cards,
    savedBoards: existingUser?.savedBoards || []
  })

  if (!savedUser) {
    return res.status(400).json({ error: 'Unable to save cards' })
  }

  res.json(savedUser)
})

app.put('/api/users/:email/boards', async (req, res) => {
  const email = normalizeEmail(req.params.email)
  const boards = Array.isArray(req.body?.boards) ? req.body.boards : []

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  await getPgClient()
  await migrateLegacyUsersToDb()

  const existingUser = await getUserFromStore(email)

  const savedUser = await upsertUserInStore({
    email,
    firstName: normalizeName(req.body?.firstName || existingUser?.firstName || 'Friend'),
    cards: existingUser?.cards || [],
    savedBoards: boards
  })

  if (!savedUser) {
    return res.status(400).json({ error: 'Unable to save boards' })
  }

  res.json(savedUser)
})

app.listen(PORT, () => {
  console.log(`Live with Me API running on http://localhost:${PORT}`)
})
