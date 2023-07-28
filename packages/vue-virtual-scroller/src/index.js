import config from './config'

import RecycleScroller from './components/RecycleScroller.vue'
import DynamicScroller from './components/DynamicScroller.vue'
import DynamicScrollerItem from './components/DynamicScrollerItem.vue'

export { default as IdState } from './mixins/IdState'

export {
  RecycleScroller,
  DynamicScroller,
  DynamicScrollerItem,
}

function registerComponents (app, prefix) {
  app.component(`${prefix}recycle-scroller`, RecycleScroller)
  app.component(`${prefix}RecycleScroller`, RecycleScroller)
  app.component(`${prefix}dynamic-scroller`, DynamicScroller)
  app.component(`${prefix}DynamicScroller`, DynamicScroller)
  app.component(`${prefix}dynamic-scroller-item`, DynamicScrollerItem)
  app.component(`${prefix}DynamicScrollerItem`, DynamicScrollerItem)
}

const plugin = {
  // eslint-disable-next-line no-undef
  version: VERSION,
  install (app, options) {
    const finalOptions = Object.assign({}, {
      installComponents: true,
      componentsPrefix: '',
    }, options)

    for (const key in finalOptions) {
      if (typeof finalOptions[key] !== 'undefined') {
        config[key] = finalOptions[key]
      }
    }

    if (finalOptions.installComponents) {
      registerComponents(app, finalOptions.componentsPrefix)
    }
  },
}

export default plugin
