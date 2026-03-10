import { afterEach, describe, expect, it, vi } from 'vitest'
import config from './config'
import plugin, { DynamicScroller, DynamicScrollerItem, RecycleScroller } from './index'

const initialConfig = { ...config }

describe('plugin', () => {
  afterEach(() => {
    Object.assign(config, initialConfig)
  })

  it('registers all components by default', () => {
    const app = {
      component: vi.fn(),
    }

    plugin.install(app as any)

    expect(app.component).toHaveBeenCalledWith('recycle-scroller', RecycleScroller)
    expect(app.component).toHaveBeenCalledWith('RecycleScroller', RecycleScroller)
    expect(app.component).toHaveBeenCalledWith('dynamic-scroller', DynamicScroller)
    expect(app.component).toHaveBeenCalledWith('DynamicScroller', DynamicScroller)
    expect(app.component).toHaveBeenCalledWith('dynamic-scroller-item', DynamicScrollerItem)
    expect(app.component).toHaveBeenCalledWith('DynamicScrollerItem', DynamicScrollerItem)
  })

  it('supports custom component prefixes', () => {
    const app = {
      component: vi.fn(),
    }

    plugin.install(app as any, {
      componentsPrefix: 'V',
    })

    expect(app.component).toHaveBeenCalledWith('Vrecycle-scroller', RecycleScroller)
    expect(app.component).toHaveBeenCalledWith('VRecycleScroller', RecycleScroller)
    expect(app.component).toHaveBeenCalledWith('Vdynamic-scroller', DynamicScroller)
    expect(app.component).toHaveBeenCalledWith('VDynamicScroller', DynamicScroller)
    expect(app.component).toHaveBeenCalledWith('Vdynamic-scroller-item', DynamicScrollerItem)
    expect(app.component).toHaveBeenCalledWith('VDynamicScrollerItem', DynamicScrollerItem)
  })

  it('does not register components when installComponents is false', () => {
    const app = {
      component: vi.fn(),
    }

    plugin.install(app as any, {
      installComponents: false,
      componentsPrefix: 'X',
    })

    expect(app.component).not.toHaveBeenCalled()
    expect((config as any).installComponents).toBe(false)
    expect((config as any).componentsPrefix).toBe('X')
  })

  it('exposes version', () => {
    expect(typeof plugin.version).toBe('string')
    expect(plugin.version.length).toBeGreaterThan(0)
  })
})
