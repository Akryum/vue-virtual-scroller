import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

/** Bundle captured analysis and tiny viewer into one offline HTML artifact. */
export async function writeViewer(output, ids) {
  const captures = await Promise.all(ids.map(async id => JSON.parse(await readFile(join(output, `${id}.analysis.json`), 'utf8'))))
  const script = await readFile(new URL('./viewer-client.js', import.meta.url), 'utf8')
  const payload = JSON.stringify(captures).replaceAll('<', '\\u003c')
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Benchmark CPU flamecharts</title>
<style>body{font:14px system-ui;margin:20px;background:#f4f4f3;color:#202322}select,button{font:inherit;padding:6px}canvas{display:block;background:white;width:100%;margin-top:12px}table{border-collapse:collapse}td,th{text-align:left;padding:5px}tr:nth-child(even){background:#e9ece9}#detail{white-space:pre-wrap;min-height:40px}a{color:#254c53}</style>
<h1>Benchmark CPU flamecharts</h1><label>Capture <select id="capture"></select></label> <label>Phase <select id="phase"></select></label> <button id="reset">Reset zoom</button><p>Sampled CPU stacks; widths estimate sampled time. Inclusive rows overlap. Wheel zoom; arrows pan; Home resets.</p><div id="links"></div><canvas tabindex="0" aria-label="CPU flamechart; wheel to zoom, arrows to pan" id="chart"></canvas><output id="range" aria-label="Visible time range"></output><pre id="detail"></pre><table><caption>Top self samples</caption><thead><tr><th>Source</th><th>ms</th></tr></thead><tbody id="self"></tbody></table><script>const captures=${payload};${script}</script></html>`
  await writeFile(join(output, 'flamecharts.html'), html)
}
