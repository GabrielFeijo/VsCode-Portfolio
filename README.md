# 💻 VsCode Portfolio

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0-blue?logo=react)](https://react.dev/)
[![Material UI](https://img.shields.io/badge/MUI-5.8-007FFF?logo=mui)](https://mui.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.0-black?logo=framer)](https://www.framer.com/motion/)
[![Node.js](https://img.shields.io/badge/Node.js-16.0-green?logo=node.js)](https://nodejs.org/)

## 📋 Sobre o Projeto

O **VsCode Portfolio** é uma aplicação web interativa que simula o ambiente de desenvolvimento do Visual Studio Code. Ele foi criado como um portfólio para demonstrar as habilidades do desenvolvedor e inclui links de contato direto com ele.

### 🎯 Destaques Técnicos

- **Interface Realista**: Recriação fiel da UI do VS Code, incluindo barra lateral, abas e status bar.
- **Terminal Interativo**: Um terminal funcional onde usuários podem executar comandos como `help`, `open` e `contact`.
- **Sistema de Arquivos Virtual**: Navegação intuitiva através de "arquivos" que representam as páginas do portfólio (Sobre, Projetos, Experiência).
- **Temas Dinâmicos**: Suporte completo a **Modo Claro** e **Modo Escuro**, persistente e alternável.
- **Internacionalização (i18n)**: Suporte nativo para **Português** e **Inglês**.

---

## 🌐 Demonstração Online

### Acesse Agora

| Versão       | URL                                                | Descrição                  |
| :----------- | :------------------------------------------------- | :------------------------- |
| **Produção** | [gabrielfeijo.com.br](https://gabrielfeijo.com.br) | Versão estável e otimizada |

### ⌨️ Comandos do Terminal

Experimente digitar estes comandos no terminal integrado do portfólio:

```bash
ajuda         # Exibir todos os comandos disponíveis
avaliar       # Avaliar o projeto (feedback interativo)
avaliacoes    # Ver comentários de outros visitantes
rota <nome>   # Navegar para uma página (ex: rota sobre)
mudartema     # Alternar entre Light/Dark mode
mudaridioma   # Alternar entre PT/EN
limpar        # Limpar o terminal
```

---

## 🚀 Início Rápido

### Pré-requisitos

Certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) 16+
- [npm](https://www.npmjs.com/) ou yarn

### 💻 Instalação Local

1. **Clone o repositório**

   ```bash
   git clone https://github.com/GabrielFeijo/VsCode-Portfolio.git
   cd VsCode-Portfolio
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**

   ```bash
   npm start
   ```

4. **Acesse a aplicação**
   - Abra [http://localhost:3000](http://localhost:3000) no navegador

---

## 📦 Estrutura do Projeto

```
src/
├── components/           # Componentes React reutilizáveis
│   ├── Layout/           # Estrutura principal (Sidebar, Header)
│   ├── Terminal/         # Lógica e UI do terminal interativo
│   └── Editor/           # Área de conteúdo principal
├── pages/                # "Arquivos" do portfólio
│   ├── About/            # Sobre mim
│   ├── Projects/         # Lista de projetos
│   └── Experience/       # Experiência profissional
├── hooks/                # Custom Hooks (Theme, Language)
├── context/              # Context API (Global State)
├── utils/                # Funções utilitárias
└── assets/               # Imagens e ícones
```

---

## 📊 Tecnologias Utilizadas

| Tecnologia        | Versão | Uso                                          |
| :---------------- | :----- | :------------------------------------------- |
| **React**         | 18.1   | Biblioteca de UI principal                   |
| **TypeScript**    | 4.7    | Tipagem estática e segurança                 |
| **Material UI**   | 5.8    | Componentes de interface e sistema de design |
| **Framer Motion** | 12.6   | Animações fluidas e transições               |
| **i18next**       | 23.6   | Internacionalização e tradução               |
| **React Router**  | 6.3    | Roteamento SPA                               |
| **Axios**         | 1.3    | Requisições HTTP                             |
