# Changelog

Todas as mudanças notáveis do SASI Store Monitor serão documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2026-09-02

### 🚀 Primeira versão (release)

Rebuild completo do SASI Store Monitor do zero (mock-first), marcando a primeira versão estável.

### Adicionado

- **Camada de dados modular** — gateways por domínio com adaptadores `mock` e `api`, alternados pela flag `NEXT_PUBLIC_DATA_MODE` (`mock` por padrão).
- **Autenticação** — fluxo de login com visual preservado, onboarding invite-only, recuperação de senha (`sendResetEmail`), sessão "lembrar-me", roles (OWNER/ADMIN/MEMBER) e `AuthGuard` client-side.
- **Dashboard** — KPIs, prioridades, estatísticas recentes e timeline de atividade.
- **Apps (Play Store/App Store)** — grid com modos Brasil/Internacional, modos visualização/edição, modal de criar/editar, detalhe com 6 abas (overview, versions, sync, alerts, audit, info), pin e reordenação.
- **Admin** — gerenciador de usuários (convites, roles, senha, remoção) e conexões de loja (CRUD + teste de conexão).
- **Páginas** — Activity, Notifications, Sync, Health e redirect do editor.
- **Internacionalização (i18n)** — português, inglês e árabe (com suporte RTL).
- **Theming** — tema claro/escuro com tokens via CSS variables.
- **UI Kit** — Sidebar glass, busca global (Cmd+K), dropdowns de notificações/perfil, Toast, ErrorBoundary, DataTable, StatusBadge, ModalContext genérico.
- **Infraestrutura** — 18 testes unitários, script de load test (`scripts/load-test.sh`), integração Sentry.

### Corrigido

- Loop de redirect no `/admin/connections` (AuthGuard aguarda auth resolvido).
- Race condition no redirect do AuthGuard.
- Toast exibia sucesso falso em falha de API — agora mostra erro real.
- Seletor de logo e navegação admin em modo claro.
- Bug no reset de senha (envio de e-mail no passo correto), warnings/errors de lint no app rebuildado.

### Performance (validação)

- **13.100 requests** em testes de carga, **zero falhas**.
- Throughput estável **~1000 req/s** mesmo a 200 conexões concorrentes.
- Latência **p95 < 2ms**.
- Memória do servidor: ~71MB (0.4%) em pico.

### Stack

Next 16.2.10 · React 19.2.4 · TypeScript 5 · Tailwind CSS v4 · TanStack Query · Recharts · framer-motion · lucide-react · jose.
