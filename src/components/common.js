export const props = {
  items: {
    type: Array,
    required: true,
  },

  keyField: {
    type: String,
    default: 'id',
  },

  direction: {
    type: String,
    default: 'vertical',
    validator: (value) => ['vertical', 'horizontal'].includes(value),
  },

  debounce: {
    type: [Number, String],
    default: 0,
  },
}

export function simpleArray () {
  return this.items.length && typeof this.items[0] !== 'object'
}
