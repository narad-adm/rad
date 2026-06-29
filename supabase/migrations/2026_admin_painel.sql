-- ============================================================
-- RAD — Painel de Administrador
-- Migração: rastreio de acesso, histórico de notificações e
-- views agregadas para o painel admin.
--
-- Tudo é idempotente (IF NOT EXISTS / OR REPLACE) e seguro para
-- rodar em produção sem afetar o app existente.
-- Execute no SQL Editor do Supabase.
-- ============================================================

-- ------------------------------------------------------------
-- 1. RASTREIO DE ACESSO
-- ------------------------------------------------------------

-- Colunas denormalizadas em perfis para leitura rápida no painel.
ALTER TABLE perfis
  ADD COLUMN IF NOT EXISTS ultimo_acesso  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_acessos  INTEGER NOT NULL DEFAULT 0;

-- Log de acessos (uma linha por abertura do app, com throttle no client).
CREATE TABLE IF NOT EXISTS acessos_log (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_acessos_usuario_data
  ON acessos_log(usuario_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_acessos_data
  ON acessos_log(criado_em DESC);

ALTER TABLE acessos_log ENABLE ROW LEVEL SECURITY;

-- Usuário só pode inserir o próprio acesso. Leitura é feita pelo
-- service role (painel admin), que ignora RLS.
DROP POLICY IF EXISTS "usuario_insere_proprio_acesso" ON acessos_log;
CREATE POLICY "usuario_insere_proprio_acesso"
  ON acessos_log FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- Função atômica: registra o acesso e atualiza os agregados em perfis.
CREATE OR REPLACE FUNCTION registrar_acesso(uid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO acessos_log (usuario_id) VALUES (uid);
  UPDATE perfis
     SET total_acessos = COALESCE(total_acessos, 0) + 1,
         ultimo_acesso  = NOW()
   WHERE id = uid;
END;
$$;

GRANT EXECUTE ON FUNCTION registrar_acesso(UUID) TO authenticated;

-- ------------------------------------------------------------
-- 2. HISTÓRICO DE NOTIFICAÇÕES DISPARADAS PELO ADMIN
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notificacoes_enviadas (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo         TEXT NOT NULL,
  corpo          TEXT NOT NULL,
  url            TEXT,
  alvo           TEXT NOT NULL DEFAULT 'todos', -- 'todos' ou um usuario_id
  alvo_nome      TEXT,                           -- nome legível do alvo
  total_enviado  INTEGER NOT NULL DEFAULT 0,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_enviadas_data
  ON notificacoes_enviadas(criado_em DESC);

-- Apenas service role lê/escreve. RLS ligada sem policy pública.
ALTER TABLE notificacoes_enviadas ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 3. VIEWS AGREGADAS (lidas pelo painel via service role)
-- ------------------------------------------------------------

-- Resumo por usuário: dados do perfil + auth + streak + contagens
-- de cada módulo (apenas quantidades, nunca conteúdo).
CREATE OR REPLACE VIEW admin_usuarios_resumo AS
SELECT
  p.id,
  p.nome,
  p.data_limpeza,
  p.criado_em,
  p.ultimo_acesso,
  COALESCE(p.total_acessos, 0)                                            AS total_acessos,
  u.email,
  u.last_sign_in_at,
  COALESCE(s.streak_atual, 0)                                            AS streak_atual,
  COALESCE(s.streak_maximo, 0)                                           AS streak_maximo,
  (SELECT COUNT(*) FROM checkins_reuniao   c WHERE c.usuario_id = p.id)  AS total_checkins,
  (SELECT COUNT(*) FROM leituras_spj       l WHERE l.usuario_id = p.id)  AS total_leituras,
  (SELECT COUNT(*) FROM respostas_passos   r WHERE r.usuario_id = p.id)  AS total_respostas_passos,
  (SELECT COUNT(*) FROM inventarios_diarios i WHERE i.usuario_id = p.id) AS total_inventarios,
  (SELECT COUNT(*) FROM humores_diarios    h WHERE h.usuario_id = p.id)  AS total_humores
FROM perfis p
LEFT JOIN auth.users u ON u.id = p.id
LEFT JOIN streaks    s ON s.usuario_id = p.id;

-- Totais globais por módulo (ranking de mais/menos usados).
CREATE OR REPLACE VIEW admin_metricas_modulos AS
SELECT
  (SELECT COUNT(*) FROM checkins_reuniao)    AS checkins,
  (SELECT COUNT(*) FROM leituras_spj)        AS leituras,
  (SELECT COUNT(*) FROM respostas_passos)    AS respostas_passos,
  (SELECT COUNT(*) FROM inventarios_diarios) AS inventarios,
  (SELECT COUNT(*) FROM humores_diarios)     AS humores;

-- ============================================================
-- FIM
-- ============================================================
