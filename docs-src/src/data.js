import faker from 'faker'

export function getData (count, letters) {
  const raw = {}

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')

  for (var l of alphabet) {
    raw[l] = []
  }

  for (var i = 0; i < count; i++) {
    const item = {
      name: faker.name.findName(),
      avatar: faker.internet.avatar(),
    }
    const letter = item.name.charAt(0).toLowerCase()
    raw[letter].push(item)
  }

  const data = []
  let index = 1

  for (const l of alphabet) {
    raw[l] = raw[l].sort((a, b) => a.name < b.name ? -1 : 1)
    if (letters) {
      data.push({
        index: index++,
        type: 'letter',
        value: l,
        height: 200,
      })
    }
    for (var item of raw[l]) {
      data.push({
        index: index++,
        type: 'person',
        value: item,
        height: 50,
      })
    }
  }

  return data
}
