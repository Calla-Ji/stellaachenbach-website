// Paragraph has no category/sorting field, so every post is authored there
// as "Category | Title" and we split it back apart here to drive our own
// "// category" badge instead of Paragraph's unrelated SEO tags array.
export function splitCategoryFromTitle(rawTitle) {
  const match = rawTitle?.match(/^\s*([^|]+?)\s*\|\s*(.+)$/)
  if (!match) return { category: null, title: rawTitle }
  const [, category, title] = match
  return { category, title }
}
