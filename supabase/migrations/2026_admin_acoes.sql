-- ============================================================
-- Admin Ações — funcionalidades adicionais do painel admin
-- ============================================================

-- Coluna para desativar conta sem deletar dados
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS desativado BOOLEAN NOT NULL DEFAULT FALSE;

-- Tabela de banners globais (admin cria, todos os usuários autenticados veem)
CREATE TABLE IF NOT EXISTS banners_globais (
  id          UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mensagem    TEXT         NOT NULL,
  tipo        TEXT         NOT NULL DEFAULT 'info',  -- info | aviso | erro
  ativo       BOOLEAN      NOT NULL DEFAULT TRUE,
  criado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE banners_globais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leitura_banners_ativos" ON banners_globais;
CREATE POLICY "leitura_banners_ativos" ON banners_globais
  FOR SELECT TO authenticated USING (ativo = TRUE);

-- Atualiza a view admin_usuarios_resumo para incluir a coluna desativado
CREATE OR REPLACE VIEW admin_usuarios_resumo AS
SELECT
  p.id,
  p.nome,
  p.data_limpeza,
  p.criado_em,
  p.ultimo_acesso,
  p.total_acessos,
  p.desativado,
  u.email,
  u.last_sign_in_at,
  COALESCE(s.streak_atual, 0)          AS streak_atual,
  COALESCE(s.streak_maximo, 0)         AS streak_maximo,
  COUNT(DISTINCT cr.id)::int           AS total_checkins,
  COUNT(DISTINCT ls.id)::int           AS total_leituras,
  COUNT(DISTINCT rp.id)::int           AS total_respostas_passos,
  COUNT(DISTINCT inv.id)::int          AS total_inventarios,
  COUNT(DISTINCT hd.id)::int           AS total_humores
FROM perfis p
JOIN auth.users u ON u.id = p.id
LEFT JOIN streaks s ON s.usuario_id = p.id
LEFT JOIN checkins_reuniao cr ON cr.usuario_id = p.id
LEFT JOIN leituras_spj ls ON ls.usuario_id = p.id
LEFT JOIN respostas_passos rp ON rp.usuario_id = p.id
LEFT JOIN inventarios_diarios inv ON inv.usuario_id = p.id
LEFT JOIN humores_diarios hd ON hd.usuario_id = p.id
GROUP BY
  p.id, p.nome, p.data_limpeza, p.criado_em, p.ultimo_acesso,
  p.total_acessos, p.desativado,
  u.email, u.last_sign_in_at, s.streak_atual, s.streak_maximo;
