-- Esquema do banco D1 "arte-fogao-db". Já foi aplicado ao banco criado
-- (uuid 3c348acf-de13-4989-be17-14ad4a8bef4d) — este arquivo fica aqui só
-- de referência, e para recriar o banco caso precise no futuro.

CREATE TABLE IF NOT EXISTS estado (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  dados TEXT NOT NULL,
  atualizado_em TEXT NOT NULL
);
