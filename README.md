# 💻 VS Code Portfolio — Gabriel Feijó

[![CI](https://github.com/GabrielFeijo/vscode-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/GabrielFeijo/vscode-portfolio/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Material UI](https://img.shields.io/badge/MUI-5.18-007FFF?logo=mui&logoColor=white)](https://mui.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.101-FF4154?logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Biome](https://img.shields.io/badge/Biome-2.6-60A5FA?logo=biome&logoColor=white)](https://biomejs.dev/)
[![Jest](https://img.shields.io/badge/Jest-29.7-C21325?logo=jest&logoColor=white)](https://jestjs.io/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.14-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Portfólio interativo que recria a experiência de uso do **Visual Studio Code** diretamente no navegador, projetado e desenvolvido por **Gabriel Feijó** para apresentar projetos, trajetória profissional, habilidades técnicas, conquistas e certificações em uma interface de IDE completa.

---

## 🌐 Demonstração Online

| Idioma | URL | Descrição |
| :--- | :--- | :--- |
| **Português (PT-BR)** | [gabrielfeijo.com.br](https://www.gabrielfeijo.com.br/) | Rota canônica padrão com metadados e conteúdo em português |
| **Inglês (EN)** | [gabrielfeijo.com.br/en](https://www.gabrielfeijo.com.br/en) | Rota localizada em inglês (detecção automática no primeiro acesso) |

---

## 🎯 Destaques de Engenharia e Arquitetura

- **Experiência Completa de IDE**: Barra de atividades lateral (`Sidebar`), explorador de arquivos retrátil (`AppTree`), gerenciamento de múltiplas abas com menu de contexto (`EditorContext` + `AppButtons`), editor de código/Markdown ao vivo (`MarkdownEditor` com `PrismJS`) e barra de status (`Footer`).
- **Terminal Interativo com Sistema de Arquivos Virtual**: Emulador de terminal baseado no padrão *Command Registry* (`CommandRegistry`) com autocompletar (`Tab`), histórico navegável (`↑`/`↓`), parser de flags/pipes, calculadora matemática com precedência de operadores, animações em `Canvas` (`matrix`) e editores `nano`/`vim` integrados ao armazenamento local.
- **Design System Catppuccin**: Paletas **Catppuccin Mocha** (modo escuro) e **Catppuccin Latte** (modo claro) sincronizadas entre componentes Material UI, variáveis CSS nativas, realce de sintaxe e cores ANSI do terminal.
- **Internacionalização e SEO Pré-renderizado**: Suporte completo a **Português (`pt-BR`)** e **Inglês (`en`)** via `i18next` e rotas localizadas (`/` e `/en/*`). O pipeline de build gera páginas HTML estáticas por rota e idioma com tags Open Graph, Twitter Cards, `hreflang` bidirecional e dados estruturados JSON-LD (`Person`, `WebSite`, `ProfilePage`/`WebPage`) validados automaticamente.
- **Resiliência de Rede e Validação de Fronteira**: Cliente HTTP (`Axios` + `TanStack Query v5`) validado na fronteira com schemas `Zod`, protegendo a aplicação contra payloads inesperados ou respostas HTML de fallback, sem bloquear a renderização inicial da interface.
- **Segurança e Qualidade Automatizadas**: Sanitização de HTML/Markdown com `rehype-sanitize`, política estrita de `Content-Security-Policy` (sem `unsafe-inline` em scripts), `HSTS`, `COOP` e suíte de testes automatizados em `Jest` + `Testing Library` com limites rigorosos de cobertura por camada.

---

## ⌨️ Comandos do Terminal Integrado

O terminal pode ser alternado a qualquer momento pelo atalho `Ctrl + J` (ou pelo botão na barra de status). Todos os comandos suportam autocompletar com `Tab` e possuem aliases em português e inglês:

### 🧭 Navegação e Portfólio

| Comando | Aliases | Exemplo | Descrição |
| :--- | :--- | :--- | :--- |
| `help` | `ajuda` | `help` | Lista todos os comandos disponíveis no terminal e na API |
| `route <página>` | `rota` | `route projects` | Navega para uma rota (`about-me`, `skills`, `projects`, `experience`, `accomplishments`, `certificates`) |
| `code <arquivo>` | — | `code projects.html` | Abre uma página do portfólio em aba ou retorna à tela inicial (`code .`) |
| `reviews` | `avaliacoes` | `reviews` | Busca e exibe as avaliações enviadas por visitantes |
| `evaluate` | `avaliar` | `evaluate` | Abre o modal interativo de avaliação do portfólio |
| `theme` | `tema`, `changetheme`, `mudartema` | `theme` | Alterna entre os temas claro e escuro |
| `lang` | `idioma`, `changelanguage`, `mudaridioma` | `lang` | Alterna o idioma da interface entre Português e Inglês |

### 📁 Sistema de Arquivos Virtual e Editores

| Comando | Opções / Argumentos | Descrição |
| :--- | :--- | :--- |
| `ls` | `[-a] [-l] [caminho]` | Lista diretórios e arquivos do sistema virtual |
| `cd` | `<diretório>` / `-` | Altera o diretório atual (suporta `~`, `..` e `cd -`) |
| `pwd` | — | Exibe o caminho absoluto do diretório atual |
| `tree` | `[diretório]` | Renderiza a árvore hierárquica de diretórios e arquivos |
| `cat` | `<arquivo>` | Exibe o conteúdo completo de um arquivo virtual |
| `head` / `tail` | `[-n <linhas>] <arquivo>` | Exibe as primeiras ou últimas linhas de um arquivo |
| `touch` / `mkdir` | `<nome>` | Cria arquivos vazios ou diretórios na sessão atual |
| `rm` | `[-r] <caminho>` | Remove arquivos ou diretórios do sistema virtual |
| `nano` / `vim` / `vi` | `<arquivo>` | Abre o editor interativo no terminal (salva alterações das páginas no `localStorage`) |
| `reset` | `reset-data`, `restore` | Restaura páginas editadas e o sistema de arquivos virtual para o padrão de fábrica |

### 🛠️ Utilitários, Sistema e Easter Eggs

| Comando | Argumentos | Descrição |
| :--- | :--- | :--- |
| `neofetch` | — | Exibe resumo do sistema, stack, tema ativo e tempo de sessão |
| `calc` | `calcular <expressão>` | Avalia expressões matemáticas (`+`, `-`, `*`, `/`, `%`, `^`, parênteses) |
| `grep` | `[-i] <padrão> [arquivo]` | Filtra linhas que correspondem ao padrão informado |
| `wc` | `<arquivo>` | Conta linhas, palavras e bytes de um arquivo |
| `whoami` / `date` / `uptime` | — | Exibe usuário ativo, data/hora localizada e tempo de atividade |
| `history` / `echo` / `man` | `[argumento]` | Histórico de comandos executados, impressão de texto e páginas de manual |
| `ping` / `curl` | `<alvo>` | Simula diagnóstico de conectividade e inspeção de cabeçalhos HTTP |
| `matrix` / `cowsay` / `banner` | `[texto]` | Animação Matrix em Canvas (`q` ou `Ctrl+C` para sair) e geradores ASCII |
| `clear` | `limpar` | Limpa o histórico visual do terminal |

---

## ⚡ Atalhos de Teclado

| Atalho | Ação |
| :--- | :--- |
| `Ctrl + B` | Mostrar ou ocultar o explorador de arquivos lateral |
| `Ctrl + J` | Abrir ou minimizar o painel do terminal integrado (desktop) |
| `Ctrl + D` | Alternar entre tema escuro (Mocha) e claro (Latte) |
| `Ctrl + L` | Alternar idioma entre Português (`PT-BR`) e Inglês (`EN`) |
| `Ctrl + H` | Navegar imediatamente para a página inicial (`Home`) |
| `Ctrl + S` / `Cmd + S` | Salvar alterações quando o modo de edição de página estiver ativo |
| `Escape` | Fechar modais ativos (Atalhos de Teclado, Avaliação) |

---

## 📦 Estrutura do Projeto

```text
VsCode-Portfolio/
├── public/                        # Assets estáticos, favicons, robots.txt, sitemap.xml e site.webmanifest
├── scripts/
│   ├── generate-seo-pages.mjs     # Pós-build: gera HTML estático localizado e JSON-LD para cada rota/idioma
│   └── validate-seo.mjs           # Pós-build: valida canonicals, hreflang, títulos únicos, JSON-LD e sitemap
├── src/
│   ├── app/
│   │   ├── components/            # Componentes de UI (Terminal, MDContainer, MarkdownRenderer, Rating, Loading...)
│   │   ├── hooks/                 # Hooks de aplicação (useViewport, useSplash, useAppKeyboardShortcuts, useMarkdownPage)
│   │   ├── layout/                # Shell do VS Code (App, Sidebar, AppTree, AppButtons, Footer, Metadata, Terminal)
│   │   ├── pages/                 # Página Home e mapeamento de rotas localizadas (pages.ts)
│   │   └── theme/                 # Paletas Catppuccin (Mocha/Latte) e configuração do tema Material UI
│   ├── config/                    # Fonte única de verdade de SEO (seo.json, seo.ts), siteConfig e validação de env (Zod)
│   ├── constants/                 # Constantes de layout, breakpoints e animações
│   ├── contexts/                  # Contextos globais (EditorContext, LayoutContext, ThemeContext)
│   ├── domain/                    # Contratos e entidades de domínio (Page, Language, Command, Review)
│   ├── hooks/queries/             # Hooks TanStack Query (useHomeQuery, useCommandsQuery, useReviewsQuery)
│   ├── i18n/                      # Inicialização do i18next e persistência/detecção de preferência de idioma
│   ├── locales/                   # Dicionários de tradução (pt/translation.json e en/translation.json)
│   ├── pages/                     # Conteúdo das páginas do portfólio em HTML/Markdown (pt/ e en/)
│   ├── services/
│   │   ├── api/                   # Cliente Axios, schemas Zod de fronteira e serviços (Home, Command, Review)
│   │   ├── terminal/              # Sistema de arquivos virtual do terminal (projectFileSystem.ts)
│   │   └── storageService.ts      # Persistência local segura e versionada no localStorage
│   └── utils/                     # Barramento de eventos customizados (appEvents), sanitização e variantes Framer Motion
└── tests/                         # Suíte de testes unitários e de integração espelhando a estrutura de src/
```

---

## 🚀 Início Rápido

### Pré-requisitos

- **Node.js** `>= 22.14.0` (versão especificada em `.nvmrc`)
- **npm** `>= 10`

### 1. Clone o repositório e instale as dependências

```bash
git clone https://github.com/GabrielFeijo/vscode-portfolio.git
cd vscode-portfolio
npm install
```

### 2. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Variáveis disponíveis:

| Variável | Obrigatória | Padrão | Descrição |
| :--- | :---: | :--- | :--- |
| `VITE_NAME` | Não | `Gabriel Feijó` | Nome exibido no título base do documento HTML |
| `VITE_URL` | Não | `""` | URL base da API backend (ex.: `https://api.gabrielfeijo.com.br`). Quando vazia, a aplicação opera de forma 100% autônoma com os comandos e dados locais |

### 3. Execute em ambiente de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

---

## 🧪 Scripts Disponíveis

| Script | Comando | Descrição |
| :--- | :--- | :--- |
| `npm run dev` | `vite` | Inicia o servidor de desenvolvimento Vite na porta `3000` |
| `npm run build` | `vite build && node scripts/generate-seo-pages.mjs && node scripts/validate-seo.mjs` | Gera o bundle de produção em `build/`, pré-renderiza páginas SEO para todas as rotas PT/EN e valida os artefatos gerados |
| `npm run preview` | `vite preview` | Serve localmente o bundle de produção na porta `4173` |
| `npm run validate` | `npm run check && npm run typecheck && npm test && npm run build` | Executa o pipeline completo de qualidade (lint/format, tipagem, testes com cobertura e build SEO) |
| `npm run check` | `biome check` | Verifica formatação, regras de lint e organização de imports com Biome |
| `npm run check:write` | `biome check --write` | Aplica correções automáticas de formatação e lint com Biome |
| `npm run typecheck` | `tsc --noEmit` | Executa a verificação estática de tipos do TypeScript |
| `npm test` | `jest --config jest.config.cjs --coverage` | Executa toda a suíte de testes unitários e de integração com relatório de cobertura |
| `npm run seo:check` | `node scripts/validate-seo.mjs` | Valida o HTML pré-renderizado, `sitemap.xml`, `robots.txt` e `site.webmanifest` no diretório `build/` |

---

## 📊 Stack Tecnológica

| Categoria | Tecnologia | Versão | Papel no Projeto |
| :--- | :--- | :--- | :--- |
| **Core & UI** | React + TypeScript | `18.3` / `5.9` | Construção da interface declarativa com tipagem estática estrita |
| **Bundler** | Vite | `7.3` | Servidor de desenvolvimento ultrarrápido e empacotamento otimizado por chunks |
| **Estilização & Temas** | Material UI + Emotion + CSS Modules | `5.18` | Sistema de layout, árvore de diretórios (`@mui/x-tree-view`) e estilização modular |
| **Animações** | Framer Motion | `12.38` | Transições de abas, gaveta lateral, modais e dock do terminal |
| **Estado Assíncrono & Validação** | TanStack React Query + Axios + Zod | `5.101` / `4.3` | Cache de requisições, retentativas com *exponential backoff* e validação de schemas |
| **Formulários** | React Hook Form + Hookform Resolvers | `7.72` / `5.2` | Gerenciamento e validação do formulário de avaliação (`BoxRating`) |
| **Markdown & Código** | react-markdown + rehype-sanitize + PrismJS | `8.0` / `6.0` / `1.30` | Renderização segura de conteúdo HTML/Markdown e editor com syntax highlighting |
| **Roteamento & SEO** | React Router + react-helmet-async | `7.14` / `2.0` | Roteamento SPA localizado e sincronização dinâmica de metadados `<head>` |
| **Qualidade & Testes** | Biome + Jest + Testing Library | `2.6` / `29.7` | Padronização de código, linting estático e testes automatizados com cobertura exigida |

---

## 📄 Licença

Distribuído sob a licença **MIT**. Desenvolvido por [Gabriel Feijó](https://www.linkedin.com/in/gabriel-feijo/).
