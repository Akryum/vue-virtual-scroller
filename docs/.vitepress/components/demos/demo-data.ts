export interface PersonRow {
  id: number
  index: number
  type: 'person' | 'letter'
  value: string | Person
  height: number
}

export interface Person {
  name: string
  initials: string
  hue: number
}

export interface MessageRow {
  id: number
  user: string
  initials: string
  hue: number
  message: string
  timestamp: string
}

export interface TableRow {
  id: number
  name: string
  email: string
  region: string
  status: 'Active' | 'Review' | 'Paused'
  summary: string
}

const FIRST_NAMES = [
  'Avery',
  'Riley',
  'Jordan',
  'Quinn',
  'Morgan',
  'Rowan',
  'Sage',
  'Parker',
  'Casey',
  'Reese',
  'Dakota',
  'Alex',
  'Jamie',
  'Taylor',
  'Harper',
  'Mika',
  'Noa',
  'Arden',
  'River',
  'Kai',
]

const LAST_NAMES = [
  'Anderson',
  'Bennett',
  'Carter',
  'Diaz',
  'Edwards',
  'Fletcher',
  'Garcia',
  'Hughes',
  'Ingram',
  'Johnson',
  'Khan',
  'Lopez',
  'Miller',
  'Nguyen',
  'Ortiz',
  'Patel',
  'Quincy',
  'Rivera',
  'Sato',
  'Turner',
]

const WORDS = [
  'virtual',
  'scrolling',
  'profile',
  'buffer',
  'dynamic',
  'render',
  'smooth',
  'window',
  'active',
  'message',
  'compute',
  'layout',
  'viewport',
  'recycle',
  'velocity',
  'index',
  'height',
  'width',
  'visibility',
  'performant',
  'batch',
  'stream',
  'queue',
  'resize',
  'observe',
  'compose',
  'discover',
  'cluster',
  'card',
  'slot',
]

const REGIONS = [
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Middle East',
]

const STATUSES: TableRow['status'][] = [
  'Active',
  'Review',
  'Paused',
]

const EMAIL_DOMAINS = [
  'northstar.app',
  'harborcloud.dev',
  'latticeops.io',
  'summitgrid.co',
  'cinderlane.net',
]

const SLUG_SEPARATOR_RE = /[^a-z0-9]+/g
const SLUG_TRIM_RE = /^-|-$/g

function createRng(seed = 1) {
  let value = seed >>> 0
  return () => {
    value = (Math.imul(1664525, value) + 1013904223) >>> 0
    return value / 4294967296
  }
}

function pick<T>(rng: () => number, values: T[]) {
  return values[Math.floor(rng() * values.length)]
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function slugify(text: string) {
  return text.toLowerCase().replace(SLUG_SEPARATOR_RE, '-').replace(SLUG_TRIM_RE, '')
}

function sentence(rng: () => number, minWords = 8, maxWords = 20) {
  const length = minWords + Math.floor(rng() * (maxWords - minWords + 1))
  const parts: string[] = []
  for (let i = 0; i < length; i++) {
    parts.push(pick(rng, WORDS))
  }
  return `${capitalize(parts.join(' '))}.`
}

function initialsFromName(name: string) {
  const parts = name.split(' ')
  return `${parts[0]?.charAt(0) ?? ''}${parts[1]?.charAt(0) ?? ''}`.toUpperCase()
}

function hueFromText(text: string, salt = 0) {
  let hash = salt
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) % 360
  }
  return (hash + 360) % 360
}

export function avatarStyle(hue: number) {
  return {
    background: `linear-gradient(145deg, hsl(${hue} 68% 44%), hsl(${(hue + 32) % 360} 70% 36%))`,
  }
}

export function createPeopleRows(count: number, withLetters = true, seed = 42) {
  const rng = createRng(seed)
  const byLetter = new Map<string, Person[]>()

  for (let i = 0; i < count; i++) {
    const name = `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`
    const letter = name.charAt(0).toLowerCase()
    const person: Person = {
      name,
      initials: initialsFromName(name),
      hue: hueFromText(name),
    }
    const bucket = byLetter.get(letter) ?? []
    bucket.push(person)
    byLetter.set(letter, bucket)
  }

  const rows: PersonRow[] = []
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
  let index = 0
  let id = 1

  for (const letter of letters) {
    const bucket = (byLetter.get(letter) ?? []).sort((a, b) => a.name.localeCompare(b.name))
    if (!bucket.length)
      continue

    if (withLetters) {
      rows.push({
        id: id++,
        index: index++,
        type: 'letter',
        value: letter,
        height: 96,
      })
    }

    for (const person of bucket) {
      rows.push({
        id: id++,
        index: index++,
        type: 'person',
        value: person,
        height: 74,
      })
    }
  }

  return rows
}

export function createMessages(count: number, seed = 99) {
  const rng = createRng(seed)
  const list: MessageRow[] = []

  for (let i = 0; i < count; i++) {
    const user = `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`
    const timestamp = `${String(8 + Math.floor((i % 720) / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`
    list.push({
      id: i + 1,
      user,
      initials: initialsFromName(user),
      hue: hueFromText(user, i),
      message: `${sentence(rng)} ${rng() > 0.5 ? sentence(rng, 4, 11) : ''}`.trim(),
      timestamp,
    })
  }

  return list
}

export function mutateMessage(row: MessageRow, seed = 1234) {
  const rng = createRng(seed + row.id)
  row.message = `${sentence(rng, 5, 14)} ${sentence(rng, 8, 18)}`
}

export function createSimpleStrings(count: number, seed = 7) {
  const rng = createRng(seed)
  const list: string[] = []
  for (let i = 0; i < count; i++) {
    list.push(`${sentence(rng, 5, 14)} ${rng() > 0.6 ? sentence(rng, 4, 10) : ''}`.trim())
  }
  return list
}

export function createTableRows(count: number, seed = 314) {
  const rng = createRng(seed)
  const list: TableRow[] = []

  for (let i = 0; i < count; i++) {
    const firstName = pick(rng, FIRST_NAMES)
    const lastName = pick(rng, LAST_NAMES)
    const region = pick(rng, REGIONS)
    const status = pick(rng, STATUSES)
    const domain = pick(rng, EMAIL_DOMAINS)
    const summary = sentence(rng, 5, 18)

    list.push({
      id: i + 1,
      name: `${firstName} ${lastName}`,
      email: `${slugify(firstName)}.${slugify(lastName)}${(i % 17) + 1}@${domain}`,
      region,
      status,
      summary,
    })
  }

  return list
}

const GRADIENTS = [
  'linear-gradient(145deg, #57cc99, #2d6a4f)',
  'linear-gradient(145deg, #ff8fa3, #7b2cbf)',
  'linear-gradient(145deg, #56cfe1, #4361ee)',
  'linear-gradient(145deg, #ffd166, #f77f00)',
  'linear-gradient(145deg, #52b788, #1b4332)',
  'linear-gradient(145deg, #f8961e, #f94144)',
]

export function gradientAt(index: number) {
  return GRADIENTS[index % GRADIENTS.length]
}
