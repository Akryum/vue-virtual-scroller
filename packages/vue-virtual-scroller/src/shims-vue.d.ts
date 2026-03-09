declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}

declare module 'mitt' {
  interface Emitter {
    all: Map<string, Set<Function>>
    on(type: string, handler: Function): void
    off(type: string, handler: Function): void
    emit(type: string, event?: any): void
  }
  export default function mitt(): Emitter
}
