export const props = {
  items: {
    type: Array,
    required: true,
  },

  keyField: {
    type: String,
    default: 'id',
  },
}

export function simpleArray () {
  return this.items.length && typeof this.items[0] !== 'object'
}
