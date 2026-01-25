export function localIntent(text: string): string[] {
  const t = text.toLowerCase()
  const tags: string[] = []

  if (/(khafif|khafeef|ta3ban|light)/.test(t)) tags.push("light")
  if (/(se7i|healthy|diet)/.test(t)) tags.push("healthy")
  if (/(7elw|sweet|dessert)/.test(t)) tags.push("sweet")
  if (/(sare3|quick|fast)/.test(t)) tags.push("sare3")
  if (/(ta2lidi|traditional|classic)/.test(t)) tags.push("te2lidi")
  if (/(shab3an|filling|full)/.test(t)) tags.push("beshabe3")
  if (/(taza|fresh|new)/.test(t)) tags.push("fresh")
  if (/(ra7a|comfort|relax)/.test(t)) tags.push("comfy")
  if (/(te2il|heavy|rich|desem)/.test(t)) tags.push("desem")
  if (/(mashhour|popular|famous|trendy)/.test(t)) tags.push("trendy")

  return Array.from(new Set(tags))
}
