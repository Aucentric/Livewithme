export type SavedBoard = {
  id: string
  title: string
  vision: string
  palette: string[]
  content: string
  description?: string
  createdAt: string
  updatedAt?: string
  text?: string
}

export const SAVED_BOARDS_STORAGE_KEY = 'liveWithMeSavedBoards'

export const normalizeSavedBoards = (value: unknown): SavedBoard[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === 'object')
    .map((entry) => {
      const palette = Array.isArray(entry.palette)
        ? entry.palette.filter((color): color is string => typeof color === 'string')
        : []

      const content = typeof entry.content === 'string'
        ? entry.content
        : typeof entry.text === 'string'
          ? entry.text
          : ''

      return {
        id: typeof entry.id === 'string' && entry.id ? entry.id : `${entry.vision || 'board'}-${Date.now()}-${Math.random()}`,
        title: typeof entry.title === 'string' && entry.title ? entry.title : 'Untitled Board',
        vision: typeof entry.vision === 'string' && entry.vision ? entry.vision : 'somewhere-far-away',
        palette,
        content,
        description: typeof entry.description === 'string' ? entry.description : '',
        createdAt: typeof entry.createdAt === 'string' && entry.createdAt ? entry.createdAt : new Date().toISOString(),
        updatedAt: typeof entry.updatedAt === 'string' ? entry.updatedAt : undefined,
        text: typeof entry.text === 'string' ? entry.text : undefined
      }
    })
}
