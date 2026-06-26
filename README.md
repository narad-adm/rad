# RAD — Recuperação Ativa Diária

App de gamificação da recuperação para membros de Narcóticos Anônimos.

## Stack
- Next.js 16 (App Router)
- TypeScript + Tailwind v4
- Supabase (PostgreSQL + Auth)
- Vercel

## Setup

### 1. Banco de dados
Execute `supabase/schema.sql` no SQL Editor do Supabase.

### 2. Variáveis de ambiente
```
NEXT_PUBLIC_SUPABASE_URL=https://fbavtjkucwbqvjdjcgti.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### 3. Rodar localmente
```bash
npm install
npm run dev
```

## Sistema de pontuação

| Atividade | Pontos |
|-----------|--------|
| Check-in de reunião | +30 |
| Bônus resistência (foi sem querer) | +20 extra |
| Leitura do Só por Hoje | +20 |
| 10° Passo (inventário) | +25 |
| Resposta do Guia dos Passos | +15 |

- Teto diário: 100 pontos
- ≥70 pts = Excelente 🌊
- 40-69 pts = Bom 💧
- 15-39 pts = Atenção ⚡
- <15 pts = Risco 🔴
- Pontuação zera à meia-noite (incentivo à prática diária)

## Deploy na Vercel
1. Suba para o GitHub: `git push`
2. Importe na Vercel
3. Adicione as 3 variáveis de ambiente
4. Deploy
