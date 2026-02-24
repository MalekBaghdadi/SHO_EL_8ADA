export function localIntent(text: string): string[] {
  const t = text.toLowerCase()
  const tags: string[] = []

  if (/(khafif|khafeef|ta3ban|light)/.test(t)) tags.push("light")
  if (/(se7i|healthy|diet)/.test(t)) tags.push("healthy")
  if (/(7elw|sweet|dessert)/.test(t)) tags.push("sweet")
  if (/(sare3|quick|fast)/.test(t)) tags.push("quick")
  if (/(ta2lidi|traditional|classic|3arabe|authentic)/.test(t)) tags.push("traditional")
  if (/(shab3an|filling|full|te2il|heavy|rich|desem)/.test(t)) tags.push("heavy")
  if (/(taza|fresh|new|crisp)/.test(t)) tags.push("fresh")
  if (/(ra7a|comfort|relax|comfy)/.test(t)) tags.push("comfort")
  if (/(mashhour|popular|famous|trendy)/.test(t)) tags.push("trendy")
  if (/(7ar|spicy|hot|fiery)/.test(t)) tags.push("spicy")

  return Array.from(new Set(tags))
}
