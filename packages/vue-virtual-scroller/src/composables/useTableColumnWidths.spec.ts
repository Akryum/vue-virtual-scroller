import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, nextTick, reactive, ref } from 'vue'
import { useTableColumnWidths } from './useTableColumnWidths'

interface TestCell {
  text: string
  width: number
}

interface TestRowState {
  cells: TestCell[]
  hidden?: boolean
  invisible?: boolean
  ariaHidden?: boolean
  zeroWidth?: boolean
}

function setRectWidth(el: Element, getWidth: () => number) {
  Object.defineProperty(el, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      width: getWidth(),
      height: 20,
      top: 0,
      right: getWidth(),
      bottom: 20,
      left: 0,
      x: 0,
      y: 0,
      toJSON() {},
    }),
  })
}

function syncTableRects(table: HTMLTableElement) {
  setRectWidth(table, () => 640)

  for (const row of [...table.rows]) {
    setRectWidth(row, () => row.getAttribute('data-zero-width') === 'true' ? 0 : 640)
  }

  for (const cell of [...table.querySelectorAll('th, td')]) {
    setRectWidth(cell, () => Number(cell.getAttribute('data-width') || '0'))
  }
}

function createFrameWaiter() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

async function flushMeasurement() {
  await nextTick()
  await createFrameWaiter()
  await nextTick()
}

let originalResizeObserver: typeof globalThis.ResizeObserver
const fakeResizeObservers: FakeResizeObserver[] = []

class FakeResizeObserver {
  callback: ResizeObserverCallback
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
    fakeResizeObservers.push(this)
  }
}

beforeEach(() => {
  originalResizeObserver = globalThis.ResizeObserver
  fakeResizeObservers.length = 0
  ;(globalThis as any).ResizeObserver = FakeResizeObserver
})

afterEach(() => {
  ;(globalThis as any).ResizeObserver = originalResizeObserver
})

function mountHarness({
  header,
  rows,
  dependencyVersion = 0,
  disabled = false,
}: {
  header: TestCell[]
  rows: TestRowState[]
  dependencyVersion?: number
  disabled?: boolean
}) {
  const state = reactive({
    header,
    rows,
    dependencyVersion,
    disabled,
  })

  const Harness = defineComponent({
    setup() {
      const table = ref<HTMLTableElement>()
      const widthState = useTableColumnWidths({
        table,
        dependencies: computed(() => [state.dependencyVersion]),
        disabled: computed(() => state.disabled),
      })

      return {
        table,
        state,
        ...widthState,
      }
    },
    template: `
      <table ref="table" :style="tableStyle">
        <colgroup v-if="columnWidths.length > 0">
          <col
            v-for="(width, index) in columnWidths"
            :key="index"
            :style="{ width: \`\${width}px\` }"
          >
        </colgroup>
        <thead>
          <tr>
            <th
              v-for="(cell, index) in state.header"
              :key="\`head-\${index}\`"
              :data-width="cell.width"
            >
              {{ cell.text }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in state.rows"
            :key="\`row-\${index}\`"
            :aria-hidden="row.ariaHidden ? 'true' : null"
            :style="{
              display: row.hidden ? 'none' : '',
              visibility: row.invisible ? 'hidden' : '',
            }"
            :data-zero-width="row.zeroWidth ? 'true' : null"
          >
            <td
              v-for="(cell, cellIndex) in row.cells"
              :key="\`row-\${index}-cell-\${cellIndex}\`"
              :data-width="cell.width"
            >
              {{ cell.text }}
            </td>
          </tr>
        </tbody>
      </table>
    `,
  })

  const wrapper = mount(Harness, {
    attachTo: document.body,
  })

  const table = wrapper.element as HTMLTableElement
  syncTableRects(table)

  return {
    wrapper,
    table,
    state,
    syncRects: () => syncTableRects(table),
    vm: wrapper.vm as unknown as {
      columnWidths: number[]
      hasLockedWidths: boolean
      tableStyle: { tableLayout?: string } | undefined
      scheduleMeasure: () => void
      clear: () => void
    },
  }
}

describe('useTableColumnWidths', () => {
  it('locks widths from header and measurable body rows', async () => {
    const { wrapper, vm } = mountHarness({
      header: [
        { text: 'Name', width: 80 },
        { text: 'Email', width: 120 },
      ],
      rows: [
        {
          cells: [
            { text: 'Ada', width: 100 },
            { text: 'ada@example.com', width: 110 },
          ],
        },
        {
          cells: [
            { text: 'Linus', width: 70 },
            { text: 'a-very-long-address@example.com', width: 160 },
          ],
        },
      ],
    })

    await flushMeasurement()

    expect(vm.columnWidths).toEqual([100, 160])
    expect(vm.hasLockedWidths).toBe(true)
    expect(vm.tableStyle).toEqual({ tableLayout: 'fixed' })
    wrapper.unmount()
  })

  it('keeps locked widths stable across row churn until explicit remeasure', async () => {
    const { wrapper, state, vm } = mountHarness({
      header: [
        { text: 'Name', width: 80 },
        { text: 'Email', width: 100 },
      ],
      rows: [
        {
          cells: [
            { text: 'Ada', width: 120 },
            { text: 'ada@example.com', width: 140 },
          ],
        },
      ],
    })

    await flushMeasurement()
    expect(vm.columnWidths).toEqual([120, 140])

    state.rows = [
      {
        cells: [
          { text: 'Bo', width: 50 },
          { text: 'bo@example.com', width: 60 },
        ],
      },
    ]

    await nextTick()

    expect(vm.columnWidths).toEqual([120, 140])
    wrapper.unmount()
  })

  it('ignores spacer, hidden, invisible, zero-width, and mismatched rows', async () => {
    const { wrapper, vm } = mountHarness({
      header: [
        { text: 'Name', width: 70 },
        { text: 'Email', width: 80 },
      ],
      rows: [
        {
          cells: [
            { text: 'Visible', width: 90 },
            { text: 'visible@example.com', width: 110 },
          ],
        },
        {
          ariaHidden: true,
          cells: [
            { text: 'Spacer', width: 400 },
            { text: 'Spacer', width: 400 },
          ],
        },
        {
          hidden: true,
          cells: [
            { text: 'Hidden', width: 420 },
            { text: 'Hidden', width: 420 },
          ],
        },
        {
          invisible: true,
          cells: [
            { text: 'Invisible', width: 430 },
            { text: 'Invisible', width: 430 },
          ],
        },
        {
          zeroWidth: true,
          cells: [
            { text: 'Zero', width: 440 },
            { text: 'Zero', width: 440 },
          ],
        },
        {
          cells: [
            { text: 'Mismatch', width: 450 },
          ],
        },
      ],
    })

    await flushMeasurement()

    expect(vm.columnWidths).toEqual([90, 110])
    wrapper.unmount()
  })

  it('falls back to first measurable body row when no header exists', async () => {
    const { wrapper, state, syncRects, vm } = mountHarness({
      header: [],
      rows: [
        {
          hidden: true,
          cells: [
            { text: 'Hidden', width: 400 },
          ],
        },
        {
          cells: [
            { text: 'Ada', width: 90 },
            { text: 'ada@example.com', width: 110 },
          ],
        },
      ],
    })

    state.rows.push({
      cells: [
        { text: 'Linus', width: 120 },
        { text: 'long@example.com', width: 160 },
      ],
    })
    await nextTick()
    syncRects()

    await flushMeasurement()

    expect(vm.columnWidths).toEqual([120, 160])
    wrapper.unmount()
  })

  it('remeasures on dependency change and resize-observer width change', async () => {
    const { wrapper, state, table, vm } = mountHarness({
      header: [
        { text: 'Name', width: 70 },
        { text: 'Email', width: 80 },
      ],
      rows: [
        {
          cells: [
            { text: 'Ada', width: 90 },
            { text: 'ada@example.com', width: 110 },
          ],
        },
      ],
    })

    await flushMeasurement()
    expect(vm.columnWidths).toEqual([90, 110])

    state.rows = [
      {
        cells: [
          { text: 'Wide', width: 150 },
          { text: 'wide@example.com', width: 170 },
        ],
      },
    ]
    state.dependencyVersion++

    await flushMeasurement()
    expect(vm.columnWidths).toEqual([150, 170])

    setRectWidth(table, () => 720)
    fakeResizeObservers[0].callback([
      {
        target: table,
        contentRect: {
          width: 720,
          height: 200,
          top: 0,
          right: 720,
          bottom: 200,
          left: 0,
          x: 0,
          y: 0,
          toJSON() {},
        },
      } as unknown as ResizeObserverEntry,
    ], fakeResizeObservers[0] as unknown as ResizeObserver)

    await flushMeasurement()

    expect(vm.columnWidths).toEqual([150, 170])
    wrapper.unmount()
  })

  it('clears widths and disconnects observer on unmount', async () => {
    const { wrapper, vm } = mountHarness({
      header: [
        { text: 'Name', width: 70 },
        { text: 'Email', width: 80 },
      ],
      rows: [
        {
          cells: [
            { text: 'Ada', width: 90 },
            { text: 'ada@example.com', width: 110 },
          ],
        },
      ],
    })

    await flushMeasurement()
    expect(vm.columnWidths).toEqual([90, 110])

    vm.clear()
    await nextTick()

    expect(vm.columnWidths).toEqual([])
    expect(vm.hasLockedWidths).toBe(false)

    wrapper.unmount()

    expect(fakeResizeObservers[0].disconnect).toHaveBeenCalledTimes(1)
  })
})
