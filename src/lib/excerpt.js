// Pulls the first couple of real sentences out of a post's rendered HTML
// body, for use as the hero's blurb instead of relying on the (often
// missing or thin) subtitle field.
export function excerptFromHtml(html, sentenceCount = 2) {
  if (!html) return ''
  const container = document.createElement('div')
  container.innerHTML = html
  const text = (container.textContent || '').replace(/\s+/g, ' ').trim()
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  return sentences.slice(0, sentenceCount).join(' ').trim()
}
