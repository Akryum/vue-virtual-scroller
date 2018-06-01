import config from './config'

import VirtualScroller from './components/VirtualScroller.vue'
import RecycleList from './components/RecycleList.vue'

export {
  VirtualScroller,
  RecycleList,
}

function registerComponents (Vue, prefix) {
  Vue.component(`${prefix}virtual-scroller`, VirtualScroller)
  Vue.component(`${prefix}recycle-list`, RecycleList)
}

const plugin = {
  // eslint-disable-next-line no-undef
  version: VERSION,
  install (Vue, options) {
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
      registerComponents(Vue, finalOptions.componentsPrefix)
    }
  },
}

export default plugin

// Auto-install
let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}
if (GlobalVue) {
  GlobalVue.use(plugin)
}
