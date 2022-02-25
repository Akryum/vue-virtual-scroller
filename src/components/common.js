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

  detectHover: {
    type: Boolean,
    default: false,
  },
}

export function simpleArray () {
  return this.items.length && typeof this.items[0] !== 'object'
}
