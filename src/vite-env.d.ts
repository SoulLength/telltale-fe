interface ImportMetaEnv {
  readonly VITE_TELLTALE_API_URL: string
  readonly VITE_TEXT_WAIT_TIME: number
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}