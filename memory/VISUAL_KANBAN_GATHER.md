# 🎮 Visual Kanban Gather - Especificação do Sistema

## 📋 Visão Geral

Sistema de escritório virtual 2D pixel art que representa um Digital Twin gamificado da operação, conectado ao Kanban real operado por agentes de IA.

---

## 🏗️ Arquitetura Técnica

```
┌─────────────────────────────────────────────────────────────┐
│                    VISUAL KANBAN GATHER                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   FRONTEND   │◄──►│   BACKEND    │◄──►│   OPENCLAW   │   │
│  │   (Phaser)   │    │    (API)     │    │   (Agentes)  │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│         │                   │                   │            │
│         ▼                   ▼                   ▼            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   WebSocket  │    │  Task Store  │    │ Agent Queue  │   │
│  │   Real-time  │    │   (SQLite)   │    │   (Redis)    │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Estrutura de Dados

### Task

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'backlog' | 'todo' | 'doing' | 'review' | 'done';
  assigned_agent: string | null;
  created_at: Date;
  updated_at: Date;
  metadata?: {
    source: 'auto' | 'manual' | 'alert';
    category: string;
    estimated_hours?: number;
  };
}
```

### Agent

```typescript
interface Agent {
  id: string;
  name: string;
  role: 'planner' | 'analyst' | 'developer' | 'qa' | 'ops';
  status: 'idle' | 'walking' | 'working' | 'meeting' | 'celebrating';
  current_task: string | null;
  position: { x: number; y: number };
  avatar: AvatarConfig;
}
```

### Avatar

```typescript
interface AvatarConfig {
  sprite: string;
  color: string;
  accessory?: string;
  animation_speed: number;
}
```

---

## 🤖 Definição de Agentes

| Agente        | Função              | Cor         | Sala Principal |
| ------------- | ------------------- | ----------- | -------------- |
| **Planner**   | Cria/prioriza tasks | 🔵 Azul     | Backlog        |
| **Analyst**   | Detalha requisitos  | 🟢 Verde    | To Do          |
| **Developer** | Executa tarefas     | 🟣 Roxo     | Doing          |
| **QA**        | Valida entregas     | 🟡 Amarelo  | Review         |
| **Ops**       | Finaliza/deploy     | 🔴 Vermelho | Done           |

---

## 🗺️ Estrutura do Mapa

```
┌─────────────────────────────────────────────────────────────┐
│                     ESCRITÓRIO VIRTUAL                       │
├───────────────┬───────────────┬───────────────┬─────────────┤
│   BACKLOG     │    TO DO      │    DOING      │   REVIEW    │
│ 📋 Planejamento│ 📝 Tarefas   │ 💻 Trabalho   │ 👥 Reunião  │
│               │               │               │             │
│   [P1][P2]    │   [A1]        │   [D1][D2]    │   [Q1]      │
│               │               │               │             │
├───────────────┴───────────────┴───────────────┴─────────────┤
│                         DONE                                 │
│                    🎉 Entrega/Comemoração                     │
│                                                              │
│                        [O1]                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎭 Estados Visuais dos Avatares

```
┌─────────┐   task_assigned    ┌─────────┐   arrive_room    ┌─────────┐
│  IDLE   │ ──────────────────►│ WALKING │ ────────────────►│ WORKING │
│ (parado)│                    │(andando)│                  │(trabalho)│
└─────────┘                    └─────────┘                  └─────────┘
     ▲                              │                             │
     │                              │                             │
     │         task_complete        │         status=review       │
     └──────────────────────────────┴─────────────────────────────┘
                                          │
                                          ▼
                                    ┌──────────┐
                                    │ MEETING  │
                                    │ (reunião)│
                                    └──────────┘
                                          │
                                          │ approved
                                          ▼
                                    ┌──────────┐
                                    │CELEBRATE │
                                    │ (festa)  │
                                    └──────────┘
```

---

## 🔌 API Endpoints

### Tasks

```
GET    /api/v2/tasks              # Lista todas tasks
GET    /api/v2/tasks/:id          # Detalhes da task
POST   /api/v2/tasks              # Criar nova task
PATCH  /api/v2/tasks/:id/status   # Atualizar status
DELETE /api/v2/tasks/:id          # Remover task
```

### Agents

```
GET    /api/v2/agents             # Lista agentes
GET    /api/v2/agents/:id         # Detalhes do agente
PATCH  /api/v2/agents/:id/assign  # Atribuir task
```

### Simulation

```
POST   /api/v2/simulation/start   # Iniciar simulação
POST   /api/v2/simulation/stop    # Parar simulação
GET    /api/v2/simulation/status  # Status da simulação
```

### WebSocket

```
ws://server/ws
  - task:created
  - task:updated
  - task:moved
  - agent:moved
  - agent:status_changed
```

---

## 🔄 Regras de Autonomia

### Geração Automática de Tasks

```javascript
// Regras de alerta logístico
RULES = [
  {
    condition: (metrics) => metrics.delivery_delay > 0.05,
    action: () =>
      createTask({
        title: 'Analisar gargalo last mile',
        priority: 'high',
        category: 'logistics',
      }),
  },
  {
    condition: (metrics) => metrics.stock_level < metrics.min_stock,
    action: () =>
      createTask({
        title: 'Reposição emergencial',
        priority: 'critical',
        category: 'inventory',
      }),
  },
  {
    condition: (metrics) => metrics.error_rate > 0.02,
    action: () =>
      createTask({
        title: 'Investigar falhas operacionais',
        priority: 'high',
        category: 'operations',
      }),
  },
];
```

### Fluxo de Trabalho Automático

```
1. Planner detecta necessidade → Cria task no Backlog
2. Planner prioriza → Move para To Do
3. Analyst detalha → Atribui para Developer
4. Developer pega task → Move para Doing
5. Developer completa → Move para Review
6. QA valida → Move para Done ou retorna
7. Ops finaliza → Deploy/Entrega
```

---

## 📅 Roadmap de Implementação

### Fase 1 — MVP (Semana 1-2)

- [x] Mapa escritório 5 salas
- [x] 5 agentes com avatares
- [x] Tasks mockadas
- [x] Movimento básico entre salas
- [x] Estados visuais (idle, walking, working)

### Fase 2 — Integração (Semana 3-4)

- [ ] API REST completa
- [ ] WebSocket real-time
- [ ] Integração com OpenClaw
- [ ] Kanban dinâmico

### Fase 3 — Autonomia (Semana 5-6)

- [ ] Sistema de regras automático
- [ ] Multi-agentes trabalhando
- [ ] Tasks autogeradas
- [ ] Simulação persistente

### Fase 4 — Analytics (Semana 7-8)

- [ ] Dashboard de métricas
- [ ] Logs visuais
- [ ] Relatórios automáticos
- [ ] Mundo persistente

---

## 🎯 Próximos Passos

1. **Criar componentes do jogo**:
   - GatherGame.tsx (componente principal)
   - OfficeMap.ts (mapa do escritório)
   - AgentAvatar.ts (avatares animados)
   - TaskBoard.ts (integração visual)

2. **Implementar API**:
   - Estender rotas existentes
   - Adicionar WebSocket
   - Criar simulação

3. **Integrar com OpenClaw**:
   - Conectar agentes reais
   - Sincronizar status
   - Automatizar fluxo

---

**Status**: 🟡 Em Desenvolvimento
**Versão**: 1.0.0
**Última atualização**: 2026-02-18
