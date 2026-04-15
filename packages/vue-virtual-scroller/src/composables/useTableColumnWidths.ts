import type { ComputedRef, CSSProperties, MaybeRefOrGetter } from 'vue'
import { computed, nextTick, onBeforeUnmount, shallowRef, toValue, watch } from 'vue'

/**
 * Options for table column width locking.
 */
export interface UseTableColumnWidthsOptions {
  table: MaybeRefOrGetter<HTMLTableElement | undefined>
  dependencies?: MaybeRefOrGetter<unknown[] | Record<string, unknown> | null>
  disabled?: MaybeRefOrGetter<boolean>
}

/**
 * Public state returned by `useTableColumnWidths`.
 */
export interface UseTableColumnWidthsReturn {
  columnWidths: ComputedRef<number[]>
  hasLockedWidths: ComputedRef<boolean>
  tableStyle: ComputedRef<CSSProperties | undefined>
  scheduleMeasure: () => void
  clear: () => void
}

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

function getInlineSize(entry: ResizeObserverEntry) {
  if (entry.borderBoxSize) {
    const box = Array.isArray(entry.borderBoxSize)
      ? entry.borderBoxSize[0]
      : entry.borderBoxSize
    if (box) {
      return box.inlineSize
    }
  }

  return entry.contentRect.width
}

function getLastHeaderRow(table: HTMLTableElement) {
  const headRows = table.tHead ? [...table.tHead.rows] : []
  return headRows.at(-1) ?? null
}

function isMeasurableRow(row: HTMLTableRowElement, columnCount: number) {
  if (row.getAttribute('aria-hidden') === 'true') {
    return false
  }

  if (row.cells.length !== columnCount) {
    return false
  }

  const style = getComputedStyle(row)
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false
  }

  return row.getBoundingClientRect().width > 0
}

function isMeasurableBodyCandidate(row: HTMLTableRowElement) {
  if (row.getAttribute('aria-hidden') === 'true') {
    return false
  }

  if (row.cells.length === 0) {
    return false
  }

  const style = getComputedStyle(row)
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false
  }

  return row.getBoundingClientRect().width > 0
}

function findFirstBodyRow(table: HTMLTableElement, columnCount: number) {
  for (const body of [...table.tBodies]) {
    for (const row of [...body.rows]) {
      if (isMeasurableRow(row, columnCount)) {
        return row
      }
    }
  }

  return null
}

function resolveColumnCount(table: HTMLTableElement) {
  const headerRow = getLastHeaderRow(table)
  if (headerRow?.cells.length) {
    return headerRow.cells.length
  }

  for (const body of [...table.tBodies]) {
    for (const row of [...body.rows]) {
      if (isMeasurableBodyCandidate(row)) {
        return row.cells.length
      }
    }
  }

  return 0
}

function measureRowCells(row: HTMLTableRowElement, widths: number[]) {
  for (const [index, cell] of [...row.cells].entries()) {
    widths[index] = Math.max(widths[index] ?? 0, Math.ceil(cell.getBoundingClientRect().width))
  }
}

function measureTable(table: HTMLTableElement) {
  const columnCount = resolveColumnCount(table)
  if (!columnCount) {
    return []
  }

  const widths = Array.from({ length: columnCount }, (_, index) => index).fill(0)
  const headerRow = getLastHeaderRow(table)
  if (headerRow && headerRow.cells.length === columnCount && headerRow.getBoundingClientRect().width > 0) {
    measureRowCells(headerRow, widths)
  }

  const firstBodyRow = findFirstBodyRow(table, columnCount)
  if (!firstBodyRow && !headerRow) {
    return []
  }

  for (const body of [...table.tBodies]) {
    for (const row of [...body.rows]) {
      if (!isMeasurableRow(row, columnCount)) {
        continue
      }

      measureRowCells(row, widths)
    }
  }

  return widths.some(width => width > 0) ? widths : []
}

/**
 * Measure native table columns and expose locked widths for a `<colgroup>`.
 */
export function useTableColumnWidths(options: UseTableColumnWidthsOptions): UseTableColumnWidthsReturn {
  const widths = shallowRef<number[]>([])
  const columnWidths = computed(() => widths.value)
  const hasLockedWidths = computed(() => widths.value.length > 0)
  const tableStyle = computed<CSSProperties | undefined>(() => {
    return widths.value.length > 0 ? { tableLayout: 'fixed' } : undefined
  })

  let active = true
  let observedTable: HTMLTableElement | null = null
  let lastObservedWidth: number | null = null
  let scheduled = false
  let running = false
  let rerun = false

  const resizeObserver = typeof ResizeObserver === 'undefined'
    ? undefined
    : new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target !== observedTable) {
            continue
          }

          const width = getInlineSize(entry)
          if (width === lastObservedWidth) {
            continue
          }

          lastObservedWidth = width
          scheduleMeasure()
        }
      })

  /**
   * Clear locked widths so table can return to native auto layout.
   */
  function clear() {
    widths.value = []
  }

  async function runMeasure() {
    if (running) {
      rerun = true
      return
    }

    running = true
    clear()
    await nextTick()
    await nextFrame()
    scheduled = false

    const table = toValue(options.table)
    if (active && table && !toValue(options.disabled)) {
      widths.value = measureTable(table)
    }

    running = false
    if (rerun) {
      rerun = false
      scheduleMeasure()
    }
  }

  /**
   * Queue one width measurement pass after DOM updates settle.
   */
  function scheduleMeasure() {
    if (!active) {
      return
    }

    if (toValue(options.disabled) || !toValue(options.table)) {
      clear()
      return
    }

    if (scheduled) {
      rerun = true
      return
    }

    scheduled = true
    void runMeasure()
  }

  watch(
    () => [toValue(options.table), toValue(options.disabled)] as const,
    ([table, disabled], previousValue) => {
      const previousTable = previousValue?.[0]
      if (previousTable && resizeObserver) {
        resizeObserver.unobserve(previousTable)
      }

      observedTable = table ?? null
      lastObservedWidth = table?.getBoundingClientRect().width ?? null

      if (!table || disabled) {
        clear()
        return
      }

      resizeObserver?.observe(table)
      scheduleMeasure()
    },
    {
      immediate: true,
      flush: 'post',
    },
  )

  watch(
    () => toValue(options.dependencies) ?? null,
    () => {
      if (!toValue(options.disabled) && toValue(options.table)) {
        scheduleMeasure()
      }
    },
    {
      deep: true,
      flush: 'post',
    },
  )

  onBeforeUnmount(() => {
    active = false
    resizeObserver?.disconnect()
  })

  return {
    columnWidths,
    hasLockedWidths,
    tableStyle,
    scheduleMeasure,
    clear,
  }
}
