export function localIntent(text: string): string[] {
  const t = text.toLowerCase()
  const tags: string[] = []

  if (/(khafif|khafeef|ta3ban|light)/.test(t)) tags.push("khafeef")
  if (/(se7i|healthy|diet)/.test(t)) tags.push("se7i")
  if (/(7elw|sweet|dessert)/.test(t)) tags.push("7elw")
  if (/(sare3|quick|fast)/.test(t)) tags.push("sare3")
  if (/(ta2lidi|traditional)/.test(t)) tags.push("ta2lidi")
  if (/(shab3an|filling)/.test(t)) tags.push("shab3an")
  if (/(taza|fresh)/.test(t)) tags.push("taza")
  if (/(ra7a|comfort)/.test(t)) tags.push("ra7a")
  if (/(te2il|heavy)/.test(t)) tags.push("te2il")
  if (/(mashhour|popular)/.test(t)) tags.push("mashhour")

  return [...new Set(tags)]
}
