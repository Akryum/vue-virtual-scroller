/**
 * Write an offline viewer from final valid capture analyses.
 * @param output Directory containing captured analysis JSON and generated HTML.
 * @param ids Stable capture filename prefixes; an empty list renders an empty state.
 */
export function writeViewer(output: string, ids: readonly string[]): Promise<void>
