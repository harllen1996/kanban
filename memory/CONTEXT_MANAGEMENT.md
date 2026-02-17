# 🧹 Gestão de Memória de Contexto

## ⚠️ PROBLEMA

A memória de contexto pode ficar muito grande e travar o sistema.

## ✅ SOLUÇÃO

Limpeza automática a cada 1 hora.

---

## 📋 O que é removido

### ❌ Remover (Banal/Irrelevante):

- Detalhes de correções de bugs
- Logs de erro específicos
- Mensagens de erro completas
- Stack traces
- Detalhes de configuração repetidos
- Informações de debug
- Passos intermediários de correções

### ✅ Manter (Importante):

- Progresso das Sprints
- Decisões de arquitetura
- Configurações críticas
- Endpoints e URLs principais
- Status atual do projeto
- Próximos passos
- Commits importantes
- Estrutura de arquivos

---

## 🔄 Verificações Automáticas

### A cada 1 hora:

1. **Verificar tamanho dos arquivos**
   - Memória: máx 100KB por arquivo
   - Logs: máx 500KB por arquivo

2. **Se arquivo grande:**
   - Logar aviso
   - Identificar seções para limpar
   - Solicitar limpeza manual se necessário

3. **Rotacionar logs:**
   - Mover logs grandes para .old
   - Criar novos arquivos vazios

---

## 📊 Limites

| Tipo de Arquivo | Tamanho Máximo | Ação               |
| --------------- | -------------- | ------------------ |
| `memory/*.md`   | 100 KB         | Aviso + Limpeza    |
| `logs/*.log`    | 500 KB         | Rotação automática |
| Contexto total  | 1 MB           | Limpeza agressiva  |

---

## 🚨 Sinais de Alerta

### Contexto está grande demais se:

- [ ] Arquivo de memória > 100KB
- [ ] Log principal > 500KB
- [ ] Sistema fica lento
- [ ] Erros de memória
- [ ] Respostas demoram

---

## 🧹 Processo de Limpeza

### Manual (quando necessário):

1. **Identificar seções banais:**

   ```bash
   # Ver tamanhos
   du -sh ~/projetos-kanban/veritas-kanban/memory/*.md
   du -sh ~/projetos-kanban/veritas-kanban/logs/*.log
   ```

2. **Criar versão limpa:**
   - Manter cabeçalho
   - Manter status atual
   - Remover detalhes de bugs
   - Remover stack traces
   - Manter próximos passos

3. **Commitar limpeza:**
   ```bash
   git add memory/
   git commit -m "chore: Limpeza de contexto - remover detalhes banais"
   git push origin develop
   ```

---

## ✅ Checklists de Limpeza

### Para arquivo de memória:

- [ ] Status do projeto atualizado?
- [ ] Progresso das Sprints visível?
- [ ] URLs e endpoints principais listados?
- [ ] Próximos passos claros?
- [ ] Último commit documentado?
- [ ] Sem detalhes de bugs corrigidos?

### Para logs:

- [ ] Menos de 500KB?
- [ ] Erros recentes visíveis?
- [ ] Logs antigos rotacionados?

---

## 📝 Template Limpo

```markdown
# [Nome do Arquivo]

## Status Atual

- Sprint: X
- Branch: develop
- Servidor: ✅ Rodando

## Progresso

- Sprint 0: ✅ 100%
- Sprint 1: 🟡 X%
- Sprint 2: ⬜ 0%

## URLs

- Frontend: http://...
- API: http://...

## Próximos Passos

1. Tarefa X
2. Tarefa Y

## Último Commit

- Hash: abc123
- Mensagem: ...
```

---

## 🔔 Lembrete

**A cada 1 hora:** Verificar contexto
**A cada 30 min:** Verificar saúde do servidor
**A cada 20 min:** Executar tarefas Sprint 1

---

**Criado:** 2026-02-17 03:40 UTC
**Próxima verificação:** 2026-02-17 04:40 UTC
