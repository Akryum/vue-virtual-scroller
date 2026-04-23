/**
 * Event payload map keyed by event name.
 */
export type EventMap = object

/**
 * Event handler for one payload shape.
 */
export type EventHandler<TEvent> = (event: TEvent) => void

/**
 * Tiny typed emitter used for internal package coordination.
 */
export interface EventEmitter<TEvents extends EventMap> {
  on: <TKey extends keyof TEvents>(type: TKey, handler: EventHandler<TEvents[TKey]>) => void
  off: <TKey extends keyof TEvents>(type: TKey, handler: EventHandler<TEvents[TKey]>) => void
  emit: <TKey extends keyof TEvents>(type: TKey, event: TEvents[TKey]) => void
  clear: () => void
}

/**
 * Create lightweight event emitter without external runtime dependency.
 */
export function createEventEmitter<TEvents extends EventMap>(): EventEmitter<TEvents> {
  const handlers = new Map<keyof TEvents, Set<EventHandler<TEvents[keyof TEvents]>>>()

  return {
    on(type, handler) {
      let eventHandlers = handlers.get(type)
      if (!eventHandlers) {
        eventHandlers = new Set<EventHandler<TEvents[keyof TEvents]>>()
        handlers.set(type, eventHandlers)
      }

      eventHandlers.add(handler as EventHandler<TEvents[keyof TEvents]>)
    },

    off(type, handler) {
      const eventHandlers = handlers.get(type)
      if (!eventHandlers) {
        return
      }

      eventHandlers.delete(handler as EventHandler<TEvents[keyof TEvents]>)

      if (!eventHandlers.size) {
        handlers.delete(type)
      }
    },

    emit(type, event) {
      const eventHandlers = handlers.get(type)
      if (!eventHandlers?.size) {
        return
      }

      // Snapshot handlers so unsubscribe during emit does not skip later listeners.
      for (const handler of [...eventHandlers]) {
        handler(event as TEvents[keyof TEvents])
      }
    },

    clear() {
      handlers.clear()
    },
  }
}
