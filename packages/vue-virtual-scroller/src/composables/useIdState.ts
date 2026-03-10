import { getCurrentInstance, nextTick, onBeforeUpdate, reactive, ref, watch } from 'vue'

type IdPropFn = (vm: any) => string | number

export function useIdState({
  idProp = (vm: any) => vm.item.id,
}: { idProp?: IdPropFn | string } = {}) {
  const store = reactive<Record<string | number, unknown>>({})
  const idState = ref<unknown>(null)
  let currentId: string | number | null = null

  const instance = getCurrentInstance()!
  if (!instance) {
    throw new Error('[useIdState] Must be called inside setup()')
  }

  const getId: () => string | number = typeof idProp === 'function'
    ? () => idProp(instance.proxy)
    : () => (instance.proxy as any)[idProp]

  function idStateInit(id: string | number): unknown {
    const idStateFactory = (instance.proxy as any).$options.idState
    if (typeof idStateFactory === 'function') {
      const data = idStateFactory.call(instance.proxy, instance.proxy)
      store[id] = data
      currentId = id
      return data
    }
    else {
      throw new TypeError('[useIdState] Missing `idState` function on component definition.')
    }
  }

  function updateIdState() {
    const id = getId()
    if (id == null) {
      console.warn(`No id found for IdState with idProp: '${idProp}'.`)
    }
    if (id !== currentId) {
      if (!store[id]) {
        idStateInit(id)
      }
      idState.value = store[id]
    }
  }

  watch(getId, (value) => {
    nextTick(() => {
      currentId = value
    })
  }, { immediate: true })

  updateIdState()

  onBeforeUpdate(() => {
    updateIdState()
  })

  return {
    idState,
  }
}
