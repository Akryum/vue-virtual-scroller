import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import config from './config'
import * as index from './index'
import plugin, { DynamicScroller, DynamicScrollerItem, RecycleScroller, WindowScroller } from './index'

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
    expect(app.component).toHaveBeenCalledWith('window-scroller', WindowScroller)
    expect(app.component).toHaveBeenCalledWith('WindowScroller', WindowScroller)
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
    expect(app.component).toHaveBeenCalledWith('Vwindow-scroller', WindowScroller)
    expect(app.component).toHaveBeenCalledWith('VWindowScroller', WindowScroller)
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

  it('keeps dynamic binding options on the useDynamicScroller surface only', () => {
    expectTypeOf<import('./index').UseDynamicScrollerItemBindingOptions>().toBeObject()
    expect('useDynamicScrollerItemBinder' in index).toBe(false)
  })

  it('exports the dedicated window-scrolling surface', () => {
    expect(index.WindowScroller).toBe(WindowScroller)
    expect(typeof index.useWindowScroller).toBe('function')
  })
})
