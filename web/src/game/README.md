/\*\*

- Documentação da API do Jogo Gamificado
  \*/

# Gamificação do Veritas Kanban

Sistema de gamificação pixel art para o Veritas Kanban.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Componentes](#componentes)
- [Tipos](#tipos)
- [Configuração](#configuração)
- [Uso](#uso)

---

## Visão Geral

O jogo gamificado transforma tarefas do Kanban em personagens pixel art em um escritório virtual. Cada tarefa é representada por um personagem que pode interagir, mover e mudar de status visualmente.

### Características

- ✅ **Canvas Responsivo** - Ajusta automaticamente ao tamanho da tela
- ✅ **Pixel Art** - Sprites profissionais gerados programaticamente
- ✅ **Animações** - Movimento fluido entre salas
- ✅ **Interação** - Clique, drag & drop, zoom
- ✅ **Status Real-time** - Tarefas mudam de sala automaticamente

---

## Componentes

### KanbanGame

Componente principal que renderiza o jogo gamificado.

**Props:**

| Prop          | Tipo                                          | Obrigatório | Descrição                        |
| ------------- | --------------------------------------------- | ----------- | -------------------------------- |
| `tasks`       | `TaskData[]`                                  | Sim         | Lista de tarefas para renderizar |
| `onTaskClick` | `(taskId: string) => void`                    | Não         | Callback ao clicar em uma tarefa |
| `onTaskMove`  | `(taskId: string, newStatus: string) => void` | Não         | Callback ao mover uma tarefa     |

**Exemplo de uso:**

```tsx
import { KanbanGame } from '@/game';

function MeuComponente() {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Tarefa 1', status: 'todo', priority: 'high' },
  ]);

  return (
    <KanbanGame
      tasks={tasks}
      onTaskClick={(id) => console.log('Clicou:', id)}
      onTaskMove={(id, status) => {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      }}
    />
  );
}
```

### GameTestPage

Página de teste com dados mock e controles interativos.

---

## Tipos

### TaskData

```typescript
interface TaskData {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'blocked' | 'done';
  priority?: 'low' | 'medium' | 'high';
  type?: string;
}
```

| Campo      | Tipo                                             | Descrição                 |
| ---------- | ------------------------------------------------ | ------------------------- |
| `id`       | `string`                                         | ID único da tarefa        |
| `title`    | `string`                                         | Nome da tarefa            |
| `status`   | `'todo' \| 'in-progress' \| 'blocked' \| 'done'` | Status atual              |
| `priority` | `'low' \| 'medium' \| 'high'`                    | Prioridade (opcional)     |
| `type`     | `string`                                         | Tipo de tarefa (opcional) |

### Status

| Valor         | Sala                | Descrição             |
| ------------- | ------------------- | --------------------- |
| `todo`        | 🪑 Sala de Espera   | Tarefas pendentes     |
| `in-progress` | 💻 Área de Trabalho | Tarefas em andamento  |
| `blocked`     | 🚧 Zona Bloqueada   | Tarefas com bloqueios |
| `done`        | 🎉 Área de Sucesso  | Tarefas concluídas    |

---

## Configuração

### Phaser Config

```typescript
const GAME_CONFIG = {
  type: Phaser.AUTO,
  width: '100%',
  height: '100%',
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
};
```

### Sprites

Sprites são gerados programaticamente (sem assets externos). Tipos disponíveis:

- `character-idle` - Personagem parado
- `character-walk` - Personagem andando
- `character-work` - Personagem trabalhando
- `character-celebrate` - Personagem comemorando
- `character-blocked` - Personagem bloqueado
- `furniture-desk` - Mesa
- `furniture-chair` - Cadeira
- `furniture-computer` - Computador
- `decoration-plant` - Planta
- `decoration-coffee` - Café
- `obstacle-cone` - Cone
- `obstacle-barrier` - Barreira

---

## Uso

### Inicialização

```typescript
import { KanbanGame } from '@/game';

function App() {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  useEffect(() => {
    // Carregar tarefas da API
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => setTasks(data));
  }, []);

  return (
    <KanbanGame
      tasks={tasks}
      onTaskClick={(id) => setSelectedTask(id)}
    />
  );
}
```

### Atualizar Tarefas

```typescript
// Mudar status de uma tarefa
const moveTask = (taskId: string, newStatus: string) => {
  setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
};
```

### Interações

- **Clique** - Abre detalhes da tarefa
- **Drag** - Move o personagem para outra sala
- **Drop** - Muda o status da tarefa automaticamente
- **Zoom** - Usa scroll ou botões para zoom in/out

---

## Performance

### Otimizações

- ✅ Sprites gerados programaticamente (sem assets externos)
- ✅ Canvas responsivo com resize handler
- ✅ Animações otimizadas (tweens)
- ✅ Garbage collection otimizado

### FPS

- 60 FPS em telas médias
- 30-45 FPS em telas grandes
- Depende do tamanho do container

---

## Limitações

- ❌ Não funciona offline (requer internet para Phaser)
- ❌ Sprites são pixel art simples (sem assets externos)
- ❌ Movimento é animado (não instantâneo)
- ❌ Não suporta touch em dispositivos móveis (ainda)

---

## Futuro

### Planejado

- [ ] Suporte a touch
- [ ] Áudio e efeitos sonoros
- [ ] Exportar para PNG/SVG
- [ ] Integração com outras APIs

---

## Licença

MIT

---

**Versão:** 1.0.0
**Última atualização:** 2026-02-17
**Status:** ✅ Produção Ready
