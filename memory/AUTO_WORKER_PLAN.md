# Plano de Trabalho Automatizado - Veritas Kanban Gamificação

## 📋 Instruções para Continuidade

Este documento contém as instruções para continuar o trabalho automaticamente.

---

## 🔄 Status Atual

**Data início:** 2026-02-17 03:15 UTC
**Branch:** develop
**Sprint:** 0 completa, iniciar Sprint 1

---

## 📝 Próximas Tarefas (Sprint 1 - MVP Visual)

### Tarefa 1.1: Melhorar o canvas do jogo (2h)

- Ajustar tamanho responsivo
- Adicionar controles de zoom
- Implementar resize automático

### Tarefa 1.2: Desenhar salas do escritório (3h)

- Background mais detalhado
- Adicionar móveis (mesas, cadeiras)
- Criar áreas visuais distintas

### Tarefa 1.3: Renderizar personagens (2h)

- Substituir emojis por sprites
- Adicionar animações idle
- Diferentes sprites por tipo de tarefa

### Tarefa 1.4: Mapear tarefas para posições (2h)

- Layout de grid para cada sala
- Espaçamento automático
- Overflow handling

### Tarefa 1.5: Integrar com dados do Kanban (3h)

- Conectar com API real
- WebSocket para updates em tempo real
- Sincronização de status

---

## 🔍 Verificações de Saúde (a cada 30 min)

### Checklist:

1. Servidor rodando? (porta 3000 e 3001)
2. Sem erros no log do Vite?
3. API respondendo?
4. Frontend carregando?
5. Página de jogo acessível?

### Se encontrar erro:

1. Documentar erro no log
2. Identificar causa
3. Corrigir imediatamente
4. Commitar correção
5. Continuar Sprint

---

## 📊 Progresso

| Sprint   | Status | % Completo |
| -------- | ------ | ---------- |
| Sprint 0 | ✅     | 100%       |
| Sprint 1 | 🟡     | 0%         |
| Sprint 2 | ⬜     | 0%         |
| Sprint 3 | ⬜     | 0%         |
| Sprint 4 | ⬜     | 0%         |
| Sprint 5 | ⬜     | 0%         |

---

## 🚀 Comandos Úteis

```bash
# Reiniciar servidor
cd ~/projetos-kanban/veritas-kanban && pkill -f "pnpm dev"; pnpm dev &

# Verificar logs
tail -f ~/projetos-kanban/veritas-kanban/logs/*.log

# Commitar progresso
git add -A && git commit -m "sprint1: [descrição]"

# Push para GitHub
git push origin develop
```

---

## 🎯 Meta Final

Completar todas as 6 sprints e ter a gamificação funcionando 100%:

- Personagens pixel art
- Animações de movimento
- Interação com clique/drag
- Sprites profissionais
- Polimento final

**Prazo estimado:** 16 dias de trabalho contínuo
