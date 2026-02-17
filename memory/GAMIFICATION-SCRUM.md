# 🎮 Gamificação Kanban - Plano Scrum

## 📋 Visão do Produto

Transformar o Veritas Kanban em um escritório virtual gamificado onde:

- **Tarefas** = Personagens pixel art
- **Status** = Locais do escritório
- **Ações** = Animações e movimentos

---

## 🏃 Sprint 0: Preparação (1 dia)

### Objetivo

Blindar código e preparar ambiente de desenvolvimento.

### Tarefas

- [x] Criar branch `develop`
- [ ] Criar pasta `web/src/game/` para código isolado
- [ ] Instalar Phaser.js como dependência
- [ ] Criar componente wrapper `KanbanGame.tsx`
- [ ] Testar que nada quebrou no sistema atual

### Entrega

Ambiente pronto para desenvolvimento sem risco ao código principal.

---

## 🏃 Sprint 1: MVP Visual (3 dias)

### Objetivo

Renderizar um escritório simples com personagens estáticos.

### Tarefas

| #   | Tarefa                                   | Estimativa |
| --- | ---------------------------------------- | ---------- |
| 1.1 | Criar canvas do jogo                     | 2h         |
| 1.2 | Desenhar sala do escritório (background) | 3h         |
| 1.3 | Renderizar personagens (emoji inicial)   | 2h         |
| 1.4 | Mapear tarefas para posições             | 2h         |
| 1.5 | Integrar com dados do Kanban             | 3h         |

### Entrega

Tela mostrando personagens representando tarefas em posições fixas.

### Definição de Pronto

- [ ] Canvas renderiza sem erros
- [ ] Personagens aparecem baseado nas tarefas reais
- [ ] Layout não interfere com Kanban original
- [ ] Código isolado em `web/src/game/`

---

## 🏃 Sprint 2: Animações (3 dias)

### Objetivo

Personagens se movem quando status muda.

### Tarefas

| #   | Tarefa                                     | Estimativa |
| --- | ------------------------------------------ | ---------- |
| 2.1 | Sistema de movimento (pathfinding simples) | 4h         |
| 2.2 | Animação de transição entre salas          | 3h         |
| 2.3 | Detectar mudanças de status                | 2h         |
| 2.4 | Animações idle (personagem parado)         | 2h         |
| 2.5 | Efeitos visuais (partículas, brilho)       | 3h         |

### Entrega

Personagens se movendo automaticamente ao mudar status.

---

## 🏃 Sprint 3: Interação (3 dias)

### Objetivo

Usuário pode interagir com o jogo.

### Tarefas

| #   | Tarefa                                    | Estimativa |
| --- | ----------------------------------------- | ---------- |
| 3.1 | Clique em personagem = abrir detalhes     | 3h         |
| 3.2 | Drag & Drop para mudar status             | 4h         |
| 3.3 | Hover = mostrar info da tarefa            | 2h         |
| 3.4 | Zoom in/out                               | 2h         |
| 3.5 | Toggle entre visão jogo e Kanban clássico | 2h         |

### Entrega

Jogo totalmente interativo.

---

## 🏃 Sprint 4: Pixel Art (4 dias)

### Objetivo

Substituir emojis por sprites pixel art profissionais.

### Tarefas

| #   | Tarefa                                         | Estimativa |
| --- | ---------------------------------------------- | ---------- |
| 4.1 | Criar/adquirir sprites de personagens          | 6h         |
| 4.2 | Criar sprites de ambiente (mesa, cadeira, etc) | 4h         |
| 4.3 | Animações de walk, idle, work                  | 4h         |
| 4.4 | Sprites diferentes por tipo de tarefa          | 3h         |
| 4.5 | Sprites de agentes (robôs)                     | 2h         |

### Entrega

Visual pixel art completo e polido.

---

## 🏃 Sprint 5: Polimento (2 dias)

### Objetivo

Experiência final refinada.

### Tarefas

| #   | Tarefa                                 | Estimativa |
| --- | -------------------------------------- | ---------- |
| 5.1 | Sons e música (opcional)               | 3h         |
| 5.2 | Feedback visual (notificações no jogo) | 2h         |
| 5.3 | Performance optimization               | 3h         |
| 5.4 | Testes e bug fixes                     | 4h         |
| 5.5 | Documentação                           | 2h         |

### Entrega

Gamificação pronta para produção.

---

## 📊 Estimativa Total

| Sprint    | Duração     | Entrega Principal        |
| --------- | ----------- | ------------------------ |
| Sprint 0  | 1 dia       | Ambiente protegido       |
| Sprint 1  | 3 dias      | MVP Visual               |
| Sprint 2  | 3 dias      | Animações                |
| Sprint 3  | 3 dias      | Interação                |
| Sprint 4  | 4 dias      | Pixel Art                |
| Sprint 5  | 2 dias      | Polimento                |
| **Total** | **16 dias** | **Gamificação completa** |

---

## 🔒 Proteção do Código

### Estratégia

```
main (produção) ← develop ← feature/game-*
                      ↑
                 Merge apenas após testes
```

### Regras

1. **NUNCA** commitar direto em `main`
2. Desenvolver em `feature/game-*`
3. Testar em `develop`
4. Merge para `main` apenas após validação

### Checklist de Merge

- [ ] Jogo carrega sem erros
- [ ] Kanban original funciona normalmente
- [ ] Sem regressões em funcionalidades existentes
- [ ] Performance aceitável (< 100ms para renderizar)

---

## 🎯 Próxima Ação

**Iniciar Sprint 0** - Preparar ambiente isolado para o jogo.

Confirma para começar?
