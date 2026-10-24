/** Rich deterministic fixture. Shared fields have workload-specific business meaning. */
export interface BenchRecord {
  /** Stable identity, never recycled component identity. */
  id: number
  /** Person, product, project, or inventory identity. */
  name: string
  /** Human-readable title used as a correctness oracle. */
  title: string
  /** Domain-specific explanatory content. */
  body: string
  /** Assignee, author, or account owner. */
  owner: string
  /** Status, category, region, or owner filter facet. */
  group: string
  /** Availability or lifecycle state. */
  status: string
  /** Priority rank, with 1 most urgent. */
  priority: number
  /** Comments or reviews. */
  comments: number
  /** Price in cents, account revenue, or deterministic sort value. */
  amount: number
  /** Available product or warehouse units. */
  stock: number
  /** Reserved warehouse units. */
  reserved: number
  /** Project completion percentage. */
  progress: number
  /** Feed content discriminator. */
  kind: string
  /** Checklist or milestone descriptions. */
  steps: string[]
  /** Fixed date string, independent of machine clock/timezone. */
  updated: string
  /** Bundled image URL. */
  asset: string
  /** Measured horizontal-card width. */
  width: number
  /** Known window-feed row height. */
  height: number
  /** Matrix row coordinate. */
  row: number
  /** Matrix column coordinate. */
  column: number
  /** Observable revision after a record update. */
  version: number
  /** Diff line number in the old file, when the line exists there. */
  oldLine?: number | null
  /** Diff line number in the new file, when the line exists there. */
  newLine?: number | null
}
