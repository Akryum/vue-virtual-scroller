import type { App } from 'vue'
import type { PluginOptions } from './types.js'
import DynamicScroller from './components/DynamicScroller.vue'
import DynamicScrollerItem from './components/DynamicScrollerItem.vue'
import RecycleScroller from './components/RecycleScroller.vue'
import WindowScroller from './components/WindowScroller.vue'
import config from './config.js'

export { useDynamicScroller } from './composables/useDynamicScroller.js'
export type { UseDynamicScrollerItemBindingOptions, UseDynamicScrollerOptions, UseDynamicScrollerReturn } from './composables/useDynamicScroller.js'
export { useDynamicScrollerItem } from './composables/useDynamicScrollerItem.js'
export type { UseDynamicScrollerItemOptions, UseDynamicScrollerItemReturn } from './composables/useDynamicScrollerItem.js'

export { useIdState } from './composables/useIdState.js'
export { useRecycleScroller } from './composables/useRecycleScroller.js'
export type { UseRecycleScrollerOptions, UseRecycleScrollerReturn } from './composables/useRecycleScroller.js'
export { useTableColumnWidths } from './composables/useTableColumnWidths.js'
export type { UseTableColumnWidthsOptions, UseTableColumnWidthsReturn } from './composables/useTableColumnWidths.js'
export { useWindowScroller } from './composables/useWindowScroller.js'
export type { UseWindowScrollerOptions, UseWindowScrollerReturn } from './composables/useWindowScroller.js'

export {
  DynamicScroller,
  DynamicScrollerItem,
  RecycleScroller,
  WindowScroller,
}

export type * from './types.js'

function registerComponents(app: App, prefix: string) {
  app.component(`${prefix}recycle-scroller`, RecycleScroller)
  app.component(`${prefix}RecycleScroller`, RecycleScroller)
  app.component(`${prefix}dynamic-scroller`, DynamicScroller)
  app.component(`${prefix}DynamicScroller`, DynamicScroller)
  app.component(`${prefix}dynamic-scroller-item`, DynamicScrollerItem)
  app.component(`${prefix}DynamicScrollerItem`, DynamicScrollerItem)
  app.component(`${prefix}window-scroller`, WindowScroller)
  app.component(`${prefix}WindowScroller`, WindowScroller)
}

declare const VERSION: string

const plugin = {
  version: VERSION,
  install(app: App, options?: PluginOptions) {
    const finalOptions = { ...{
      installComponents: true,
      componentsPrefix: '',
    }, ...options }

    for (const key in finalOptions) {
      if (typeof (finalOptions as any)[key] !== 'undefined') {
        (config as any)[key] = (finalOptions as any)[key]
      }
    }

    if (finalOptions.installComponents) {
      registerComponents(app, finalOptions.componentsPrefix!)
    }
  },
}

export default plugin
