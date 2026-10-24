const KEYWORDS = new Set(['const', 'let', 'if', 'return', 'await', 'export', 'function', 'for', 'of', 'new'])
const TOKEN = /('[^']*')|(\/\/.*$)|(\b\d+(?:\.\d+)?\b)|([a-z_]\w*)/gi
const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;' }
const HTML_SPECIAL = /[&<>]/g

/** Escape text for `v-html`. */
function escape(text: string) {
  return text.replace(HTML_SPECIAL, char => HTML_ESCAPES[char])
}

/**
 * Deterministic syntax highlighting into HTML, like a diff viewer's
 * pre-tokenized lines. Text content stays identical to the source line.
 */
export function highlightCode(code: string) {
  let html = ''
  let last = 0
  for (const match of code.matchAll(TOKEN)) {
    const [token, string, comment, number, word] = match
    html += escape(code.slice(last, match.index))
    const kind = string ? 'string' : comment ? 'comment' : number ? 'number' : KEYWORDS.has(word) ? 'keyword' : null
    html += kind ? `<span class="token-${kind}">${escape(token)}</span>` : escape(token)
    last = match.index + token.length
  }
  return html + escape(code.slice(last))
}
