/** Formatações usadas no painel admin. */

/** "há 3 dias", "há 2 h", "agora" — a partir de um ISO. */
export function tempoRelativo(iso: string | null): string {
  if (!iso) return 'nunca'
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h} h`
  const d = Math.floor(h / 24)
  if (d < 30) return `há ${d} ${d === 1 ? 'dia' : 'dias'}`
  const m = Math.floor(d / 30)
  if (m < 12) return `há ${m} ${m === 1 ? 'mês' : 'meses'}`
  return `há ${Math.floor(m / 12)} ano(s)`
}

/** Data curta DD/MM/AAAA. */
export function dataCurta(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

/** Quantidade de dias limpo a partir de uma data (YYYY-MM-DD). */
export function diasLimpo(dataLimpeza: string | null): number {
  if (!dataLimpeza) return 0
  const inicio = new Date(dataLimpeza + 'T00:00:00')
  const diff = Date.now() - inicio.getTime()
  return Math.max(0, Math.floor(diff / 86400000))
}

/** True se o último acesso é mais antigo que `dias`. */
export function inativoHa(ultimoAcesso: string | null, dias: number): boolean {
  if (!ultimoAcesso) return true
  return Date.now() - new Date(ultimoAcesso).getTime() > dias * 86400000
}
