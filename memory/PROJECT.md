# Veritas Kanban - Projeto Principal

## 📋 Visão Geral

Sistema Kanban web para gerenciamento de tarefas com foco em privacidade e agilidade.

---

## 🔗 Links Importantes

| Item            | URL                                   |
| --------------- | ------------------------------------- |
| **Repositório** | https://github.com/harllen1996/kanban |
| **Produção**    | http://76.13.234.181:3000             |
| **API**         | http://localhost:3001                 |

---

## 🏗️ Estrutura do Projeto

```
/root/projetos-kanban/veritas-kanban/
├── server/          # Backend Node.js + Express
│   └── src/
│       ├── index.ts           # Entry point
│       └── routes/            # API routes
├── web/             # Frontend React + Vite
│   └── src/
│       ├── components/        # Componentes React
│       └── globals.css        # Estilos globais
└── memory/          # Documentação do projeto
```

---

## ✅ O que está implementado:

### 1. Sistema Kanban Base

- Quadro com 4 colunas: A Fazer, Em Progresso, Bloqueado, Concluído
- Drag & Drop de tarefas
- Filtros e busca
- Detalhes de tarefas

### 2. Tradução PT-BR (~50%)

- SetupScreen, LoginScreen, UserMenu
- KanbanBoard, FilterBar, BulkActionsBar
- CreateTaskDialog, TaskCard, TaskDetailPanel
- Header, CommandPalette, SettingsDialog

### 3. Menu de Controle de Agentes

- Componente: `web/src/components/agents/AgentControlDialog.tsx`
- API: `server/src/routes/registry-agents.ts`
- Criar/Excluir/Status de agentes
- KeepAlive para agentes 24h

### 4. Layout Responsivo Mobile

- Scroll horizontal no KanbanBoard
- Menu hamburger para mobile
- Touch targets maiores (44px)
- Sidebar colapsável

---

## 🤖 Modelos Configurados

| Prioridade | Modelo           | Provider   |
| ---------- | ---------------- | ---------- |
| Primário   | GLM-5            | Modal      |
| Fallback 1 | GLM-4.7 Flash    | z.ai       |
| Fallback 2 | LLaMA 3.3 70B    | OpenRouter |
| Fallback 3 | Gemini 2.0 Flash | OpenRouter |

---

## 🎯 Próximo Projeto: Gamificação Pixel Art

### Conceito

Transformar o Kanban em um escritório virtual com personagens pixel art que se movem conforme o status das tarefas.

### Stack Tecnológica

- **Phaser.js** ou **PixiJS** para renderização 2D
- **React** para integração
- **Sprites Pixel Art** para personagens

### Status

🟡 Aguardando planejamento Scrum

---

## ⚠️ Proteção de Código

**Branch principal protegida:** `main`
**Branch de desenvolvimento:** `develop` (a criar)
**Branch de features:** `feature/*` (a criar)

Sempre trabalhar em branches separados antes de merge.
