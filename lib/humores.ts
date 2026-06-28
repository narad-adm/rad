export const HUMORES = [
  // ── POSITIVOS ──────────────────────────────────────────
  { key: 'calmo',      label: 'Calmo',                    emoji: '😌', corFundo: 'rgba(16,185,129,0.15)',  corBorda: 'rgba(16,185,129,0.4)',  corLabel: '#10b981', grupo: 'positivo' },
  { key: 'feliz',      label: 'Feliz',                    emoji: '😊', corFundo: 'rgba(234,179,8,0.15)',   corBorda: 'rgba(234,179,8,0.4)',   corLabel: '#d97706', grupo: 'positivo' },
  { key: 'energetico', label: 'Energético',               emoji: '🤩', corFundo: 'rgba(0,157,255,0.15)',   corBorda: 'rgba(0,157,255,0.4)',   corLabel: '#009dff', grupo: 'positivo' },
  { key: 'alegre',     label: 'Alegre',                   emoji: '😁', corFundo: 'rgba(171,145,236,0.15)', corBorda: 'rgba(171,145,236,0.4)', corLabel: '#ab91ec', grupo: 'positivo' },
  // ── NEGATIVOS ──────────────────────────────────────────
  { key: 'irritado',   label: 'Irritado',                 emoji: '😠', corFundo: 'rgba(239,68,68,0.15)',   corBorda: 'rgba(239,68,68,0.4)',   corLabel: '#ef4444', grupo: 'negativo' },
  { key: 'triste',     label: 'Triste',                   emoji: '😢', corFundo: 'rgba(125,136,230,0.15)', corBorda: 'rgba(125,136,230,0.4)', corLabel: '#7d88e6', grupo: 'negativo' },
  { key: 'ansioso',    label: 'Ansioso',                  emoji: '😰', corFundo: 'rgba(245,158,11,0.15)',  corBorda: 'rgba(245,158,11,0.4)',  corLabel: '#f59e0b', grupo: 'negativo' },
  { key: 'desanimado', label: 'Desanimado',               emoji: '😞', corFundo: 'rgba(100,116,139,0.15)', corBorda: 'rgba(100,116,139,0.4)', corLabel: '#64748b', grupo: 'negativo' },
  { key: 'culpado',    label: 'Culpado',                  emoji: '😔', corFundo: 'rgba(220,38,38,0.12)',   corBorda: 'rgba(220,38,38,0.3)',   corLabel: '#dc2626', grupo: 'negativo' },
  { key: 'obsessivo',  label: 'Pensamentos obsessivos',   emoji: '😵‍💫', corFundo: 'rgba(138,129,229,0.15)', corBorda: 'rgba(138,129,229,0.4)', corLabel: '#8a81e5', grupo: 'negativo' },
  // ── NEUTROS ────────────────────────────────────────────
  { key: 'pouca_energia', label: 'Pouca energia',         emoji: '😴', corFundo: 'rgba(100,116,139,0.12)', corBorda: 'rgba(100,116,139,0.3)', corLabel: '#94a3b8', grupo: 'neutro' },
  { key: 'confuso',    label: 'Confuso',                  emoji: '🤔', corFundo: 'rgba(178,128,230,0.12)', corBorda: 'rgba(178,128,230,0.35)', corLabel: '#b280e6', grupo: 'neutro' },
] as const

export type HumorKey = typeof HUMORES[number]['key']

export function getHumor(key: string) {
  return HUMORES.find(h => h.key === key)
}
