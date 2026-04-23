interface ImportMetaEnv {
  /**
   * Current Vite mode used while bundling or running tests.
   */
  readonly MODE: string
}

interface ImportMeta {
  /**
   * Vite-provided environment metadata.
   */
  readonly env: ImportMetaEnv
}
