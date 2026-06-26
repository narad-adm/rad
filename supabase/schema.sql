-- ============================================================
-- RAD — Recuperação Ativa Diária
-- Schema completo para Supabase
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TIPOS
-- ============================================================

CREATE TYPE tipo_reuniao_rad AS ENUM (
  'partilha', 'subcomite', 'tematica', 'evento',
  'estudo', 'abertura', 'outro'
);

-- ============================================================
-- PERFIS DE USUÁRIO
-- ============================================================

CREATE TABLE perfis (
  id               UUID PRIMARY KEY REFERENCES auth.users(id)
                   ON DELETE CASCADE,
  nome             VARCHAR(100) NOT NULL,
  data_limpeza     DATE NOT NULL,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TIPOS DE REUNIÃO (tabela de domínio)
-- ============================================================

CREATE TABLE tipos_reuniao (
  id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome   VARCHAR(100) NOT NULL UNIQUE,
  icone  VARCHAR(50),
  pontos INTEGER NOT NULL DEFAULT 30
);

INSERT INTO tipos_reuniao (nome, icone, pontos) VALUES
  ('Reunião de Partilha',   'Users',       30),
  ('Reunião de Subcomitê',  'Layers',      30),
  ('Reunião Temática',      'BookOpen',    30),
  ('Evento',                'CalendarDays',25),
  ('Estudo de Literatura',  'Book',        25),
  ('Reunião de Abertura',   'Star',        30),
  ('Outro',                 'Circle',      20);

-- ============================================================
-- CHECKINS DE REUNIÃO
-- ============================================================

CREATE TABLE checkins_reuniao (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id      UUID NOT NULL REFERENCES perfis(id)
                  ON DELETE CASCADE,
  tipo_reuniao_id UUID NOT NULL REFERENCES tipos_reuniao(id),
  data            DATE NOT NULL DEFAULT CURRENT_DATE,
  hora            TIME,
  nota_querer     SMALLINT CHECK (nota_querer BETWEEN 0 AND 10),
  nota_beneficio  SMALLINT CHECK (nota_beneficio BETWEEN 0 AND 10),
  observacao      TEXT,
  pontos_ganhos   INTEGER NOT NULL DEFAULT 30,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SÓ POR HOJE — textos diários
-- ============================================================

CREATE TABLE so_por_hoje (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mes       SMALLINT NOT NULL CHECK (mes BETWEEN 1 AND 12),
  dia       SMALLINT NOT NULL CHECK (dia BETWEEN 1 AND 31),
  titulo    VARCHAR(200) NOT NULL,
  texto     TEXT NOT NULL,
  reflexao  TEXT,
  UNIQUE (mes, dia)
);

-- Leituras registradas pelo usuário
CREATE TABLE leituras_spj (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES perfis(id)
             ON DELETE CASCADE,
  spj_id     UUID NOT NULL REFERENCES so_por_hoje(id),
  data       DATE NOT NULL DEFAULT CURRENT_DATE,
  pontos_ganhos INTEGER NOT NULL DEFAULT 20,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, data) -- uma leitura por dia
);

-- ============================================================
-- GUIA DOS PASSOS
-- ============================================================

CREATE TABLE passos_perguntas (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  passo    SMALLINT NOT NULL CHECK (passo BETWEEN 1 AND 12),
  ordem    SMALLINT NOT NULL,
  pergunta TEXT NOT NULL,
  UNIQUE (passo, ordem)
);

CREATE TABLE respostas_passos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id  UUID NOT NULL REFERENCES perfis(id)
              ON DELETE CASCADE,
  pergunta_id UUID NOT NULL REFERENCES passos_perguntas(id),
  resposta    TEXT NOT NULL,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pontos_ganhos INTEGER NOT NULL DEFAULT 15
);

-- ============================================================
-- 10° PASSO — INVENTÁRIO DIÁRIO
-- ============================================================

CREATE TABLE inventarios_diarios (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id          UUID NOT NULL REFERENCES perfis(id)
                      ON DELETE CASCADE,
  data                DATE NOT NULL DEFAULT CURRENT_DATE,
  honestidade         TEXT,
  admissoes           TEXT,
  contribuicoes       TEXT,
  doenca              TEXT,
  acoes_limpeza       TEXT,
  pontos_ganhos       INTEGER NOT NULL DEFAULT 25,
  criado_em           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, data) -- um inventário por dia
);

-- ============================================================
-- PONTUAÇÃO DIÁRIA (agregado por dia para performance)
-- ============================================================

CREATE TABLE pontuacao_diaria (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id      UUID NOT NULL REFERENCES perfis(id)
                  ON DELETE CASCADE,
  data            DATE NOT NULL DEFAULT CURRENT_DATE,
  pontos_total    INTEGER NOT NULL DEFAULT 0,
  reunioes        INTEGER NOT NULL DEFAULT 0,
  leituras        INTEGER NOT NULL DEFAULT 0,
  passos          INTEGER NOT NULL DEFAULT 0,
  inventarios     INTEGER NOT NULL DEFAULT 0,
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, data)
);

-- ============================================================
-- STREAK (dias consecutivos)
-- ============================================================

CREATE TABLE streaks (
  usuario_id       UUID PRIMARY KEY REFERENCES perfis(id)
                   ON DELETE CASCADE,
  streak_atual     INTEGER NOT NULL DEFAULT 0,
  streak_maximo    INTEGER NOT NULL DEFAULT 0,
  ultimo_dia_ativo DATE,
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_checkins_usuario_data
  ON checkins_reuniao(usuario_id, data DESC);
CREATE INDEX idx_leituras_usuario_data
  ON leituras_spj(usuario_id, data DESC);
CREATE INDEX idx_respostas_usuario
  ON respostas_passos(usuario_id, criado_em DESC);
CREATE INDEX idx_inventarios_usuario_data
  ON inventarios_diarios(usuario_id, data DESC);
CREATE INDEX idx_pontuacao_usuario_data
  ON pontuacao_diaria(usuario_id, data DESC);
CREATE INDEX idx_spj_mes_dia
  ON so_por_hoje(mes, dia);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE perfis            ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins_reuniao  ENABLE ROW LEVEL SECURITY;
ALTER TABLE leituras_spj      ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas_passos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventarios_diarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pontuacao_diaria  ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_reuniao      ENABLE ROW LEVEL SECURITY;
ALTER TABLE so_por_hoje        ENABLE ROW LEVEL SECURITY;
ALTER TABLE passos_perguntas   ENABLE ROW LEVEL SECURITY;

-- Leitura pública de tabelas de domínio
CREATE POLICY "publico_le_tipos_reuniao"
  ON tipos_reuniao FOR SELECT USING (true);
CREATE POLICY "publico_le_spj"
  ON so_por_hoje FOR SELECT USING (true);
CREATE POLICY "publico_le_passos"
  ON passos_perguntas FOR SELECT USING (true);

-- Usuário acessa apenas seus próprios dados
CREATE POLICY "usuario_proprio_perfil"
  ON perfis FOR ALL USING (auth.uid() = id);
CREATE POLICY "usuario_proprio_checkin"
  ON checkins_reuniao FOR ALL USING (auth.uid() = usuario_id);
CREATE POLICY "usuario_propria_leitura"
  ON leituras_spj FOR ALL USING (auth.uid() = usuario_id);
CREATE POLICY "usuario_propria_resposta"
  ON respostas_passos FOR ALL USING (auth.uid() = usuario_id);
CREATE POLICY "usuario_proprio_inventario"
  ON inventarios_diarios FOR ALL USING (auth.uid() = usuario_id);
CREATE POLICY "usuario_propria_pontuacao"
  ON pontuacao_diaria FOR ALL USING (auth.uid() = usuario_id);
CREATE POLICY "usuario_proprio_streak"
  ON streaks FOR ALL USING (auth.uid() = usuario_id);

-- ============================================================
-- PERGUNTAS DO GUIA DOS PASSOS (dados iniciais — amostra)
-- ============================================================

INSERT INTO passos_perguntas (passo, ordem, pergunta) VALUES
-- PASSO 1
(1, 1, 'Descreva situações em que sua vida ficou incontrolável por causa do uso de drogas.'),
(1, 2, 'O que significa para você admitir que é impotente perante a sua adição?'),
(1, 3, 'Como você tentou controlar o uso e quais foram os resultados?'),
(1, 4, 'O que você perdeu ou quase perdeu por causa da sua adição?'),
(1, 5, 'Você já admitiu para alguém que era adicto? Como foi?'),
-- PASSO 2
(2, 1, 'O que significa para você a ideia de um Poder Superior?'),
(2, 2, 'Você acredita que algo maior do que você pode restaurar sua sanidade? Por quê?'),
(2, 3, 'Quais são suas dúvidas ou resistências em relação a um Poder Superior?'),
-- PASSO 3
(3, 1, 'O que significa para você entregar sua vontade e sua vida aos cuidados de um Poder Superior?'),
(3, 2, 'Quais são as áreas da sua vida onde você ainda tenta ter controle absoluto?'),
(3, 3, 'Como você pratica a entrega no dia a dia?'),
-- PASSO 4
(4, 1, 'Liste seus pontos fortes e suas qualidades.'),
(4, 2, 'Quais são seus maiores medos?'),
(4, 3, 'Quais ressentimentos você carrega? Com quem e por quê?'),
(4, 4, 'Como sua adição afetou seus relacionamentos?'),
-- PASSO 5
(5, 1, 'Você já admitiu para Deus, para si mesmo e para outro ser humano a natureza exata de seus erros?'),
(5, 2, 'Como foi a experiência de compartilhar seu 4° passo com alguém?'),
-- PASSO 10
(10, 1, 'Você fez algo hoje pelo qual precisa se desculpar ou reparar?'),
(10, 2, 'Onde você foi honesto hoje? Onde foi desonesto?'),
(10, 3, 'Praticou alguma das suas deficiências de caráter hoje? Como?'),
(10, 4, 'O que você fez de positivo hoje para sua recuperação e para os outros?');
