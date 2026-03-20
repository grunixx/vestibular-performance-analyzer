# SIMU.AI MVP

Plataforma educacional de simulados com foco em diagnostico de estudo para ensino medio e vestibulares.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- shadcn/ui (componentes base)
- Supabase (Auth + Postgres + Storage)
- Recharts
- Canvas (rascunho por questao)

## Entrega do MVP

- Login com Supabase Auth + modo demo
- Catalogo de simulados
- Fluxo completo de prova com progresso, revisao e tempo por questao
- Canvas de rascunho com mouse/toque e persistencia
- Correcao automatica para objetivas
- Resultado com insights, graficos e feedback por questao
- Analise de padroes de erro
- Recomendacoes de estudo
- Dashboard de evolucao
- Historico e area de revisao
- Sistema de temas com 4 opcoes (White, Night, Blue, Purple) com persistencia local

## Como rodar

1. Instale dependencias:

```bash
npm install
```

2. Configure variaveis:

```bash
cp .env.example .env.local
```

Preencha:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Se nao configurar, o app funciona em modo demo com dados locais.

3. Rode em desenvolvimento:

```bash
npm run dev
```

## Banco de dados

- Script inicial: `supabase/migrations/20260319230000_init.sql`
- Cria tabelas principais: `user_profiles`, `quizzes`, `questions`, `attempts`, `attempt_answers`, `drafts`, `error_tags`, `recommendations`, `performance_summaries`.
- Cria bucket de Storage `drafts` com politica para cada usuario salvar no proprio diretorio.

## Estrutura

```text
src/
  app/                  # rotas App Router
  components/           # UI e componentes de pagina
  data/                 # seed demo
  hooks/                # hooks globais
  lib/                  # utils e clientes
  repositories/         # acesso a dados (demo/supabase)
  services/             # regra de negocio (correcao/analise/recomendacao)
  types/                # tipos de dominio
```

## Deploy alvo

- Frontend: Vercel
- Backend: Supabase

## Observacoes

- A logica principal de analise e recomendacao funciona sem IA externa.
- IA pode ser adicionada depois para apenas resumir/humanizar insights ja calculados.
