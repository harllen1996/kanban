# 🎮 Veritas Kanban - Sistema de Gamificação

Sistema de gamificação pixel art para o Veritas Kanban.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Sprints](#sprints)
- [Componentes](#componentes)
- [Tipos](#tipos)
- [Uso](#uso)
- [Atalhos de Teclado](#atalhos-de-teclado)

---

## Visão Geral

O jogo gamificado transforma tarefas do Kanban em personagens pixel art em um escritório virtual.

### ✅ Funcionalidades

- **Canvas Responsivo** - Ajusta automaticamente ao tamanho da tela
- **Pixel Art Procedural** - Sprites gerados dinamicamente
- **Pathfinding A\*** - Movimento inteligente entre salas
- **Interação Completa** - Drag & Drop, zoom, atalhos
- **Real-time** - Tarefas mudam de sala automaticamente

---

## Sprints

| Sprint | Nome         | Status  | Descrição                  |
| ------ | ------------ | ------- | -------------------------- |
| 0      | Setup        | ✅ 100% | Estrutura base do projeto  |
| 1      | MVP Visual   | ✅ 100% | Canvas, salas, personagens |
| 2      | Animações    | ✅ 100% | Pathfinding A\*, waypoints |
| 3      | Interação    | ✅ 100% | Drag & Drop, zoom, atalhos |
| 4      | Pixel Art    | ✅ 100% | Spritesheets profissionais |
| 5      | Documentação | ✅ 100% | README, API docs           |

---

## Componentes

### KanbanGame

Componente principal que renderiza o jogo.

```tsx
import { KanbanGame } from '@/game';

<KanbanGame
  tasks={tasks}
  onTaskClick={(id) => console.log('Clicou:', id)}
  onTaskMove={(id, status) => console.log('Moveu:', id, status)}
/>;
```

### SpritesheetManager

Gerencia sprites pixel art procedurais.

```tsx
import { SpritesheetManager, SpriteType } from '@/game';

const manager = new SpritesheetManager(scene);
const sprite = manager.getSprite(SpriteType.CODE);
```

### PathfindingManager

Sistema de navegação A\* entre salas.

```tsx
import { PathfindingManager } from '@/game';

const pathfinder = new PathfindingManager();
const path = pathfinder.findPathBetweenRooms('todo', 'done');
```

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

### SpriteType

```typescript
enum SpriteType {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  BLOCKED = 'blocked',
  DONE = 'done',
  CODE = 'code',
  BUG = 'bug',
  FEATURE = 'feature',
  RESEARCH = 'research',
  DOCS = 'docs',
  DESIGN = 'design',
  DEFAULT = 'default',
}
```

---

## Uso

### Página de Teste

Acesse: `http://localhost:3000/game`

### Integração com Tarefas Reais

```tsx
// Toggle entre dados reais e mock
const [useRealTasks, setUseRealTasks] = useState(true);

const { data: tasks } = useQuery({
  queryKey: ['tasks'],
  queryFn: () => fetch('/api/tasks').then((r) => r.json()),
  enabled: useRealTasks,
});
```

---

## Atalhos de Teclado

| Tecla       | Função            |
| ----------- | ----------------- |
| **D**       | Toggle modo debug |
| **R**       | Resetar zoom      |
| **+/-**     | Zoom in/out       |
| **1/2/3/4** | Navegar salas     |
| **H**       | Mostrar ajuda     |
| **ESC**     | Cancelar drag     |

### Mouse/Touch

| Ação       | Função                   |
| ---------- | ------------------------ |
| **Scroll** | Zoom in/out              |
| **Clique** | Ver detalhes da tarefa   |
| **Drag**   | Mover tarefa entre salas |
| **Pinch**  | Zoom (mobile)            |

---

## Performance

- **60 FPS** em telas médias
- **Sprites procedurais** - sem assets externos
- **Canvas responsivo** com resize handler
- **Tweens otimizados** para animações

---

## Arquivos

| Arquivo                 | Descrição            |
| ----------------------- | -------------------- |
| `KanbanGame.tsx`        | Componente principal |
| `SpritesheetManager.ts` | Pixel art procedural |
| `PathfindingManager.ts` | Navegação A\*        |
| `AnimationManager.ts`   | Animações e efeitos  |
| `InteractionManager.ts` | Interação e atalhos  |

---

## Licença

MIT

---

**Versão:** 2.0.0  
**Última atualização:** 2026-02-18  
**Status:** ✅ Produção Ready
