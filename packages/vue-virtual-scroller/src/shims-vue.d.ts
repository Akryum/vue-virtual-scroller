declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}

declare module 'mitt' {
  type EventHandler = (event?: unknown) => void

  interface Emitter {
    all: Map<string, Set<EventHandler>>
    on: (type: string, handler: EventHandler) => void
    off: (type: string, handler: EventHandler) => void
    emit: (type: string, event?: unknown) => void
  }
  export default function mitt(): Emitter
}
