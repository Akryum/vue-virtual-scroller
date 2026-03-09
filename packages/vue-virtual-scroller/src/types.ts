export type ScrollDirection = 'vertical' | 'horizontal'

export interface ScrollState {
  start: number
  end: number
}

export interface ViewNonReactive {
  id: number
  index: number
  used: boolean
  key: string | number
  type: unknown
}

export interface View {
  item: unknown
  position: number
  offset: number
  nr: ViewNonReactive
}

export interface SizeEntry {
  accumulator: number
  size?: number
}

export interface Sizes {
  [key: number]: SizeEntry
}

export interface VScrollData {
  active: boolean
  sizes: Record<string | number, number>
  keyField: string
  simpleArray: boolean
}

export interface ItemWithSize {
  item: unknown
  id: string | number
  size: number | undefined
}

export interface PluginOptions {
  installComponents?: boolean
  componentsPrefix?: string
}
