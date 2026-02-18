# Gerenciamento de Contexto - Configuração

## Regras de Ouro

### 1. Limite de Contexto: 80%

- **Limite:** 80% do contexto máximo (aprox. 105K tokens)
- **Atual:** 43% (57K/131K)
- **Ação:** Se passar de 80%, limpar memória imediatamente

### 2. Limite de Tokens: 50K

- **Limite:** 50K tokens in/out
- **Atual:** 48K in / 291 out
- **Ação:** Se passar de 50K in, limpar memória

### 3. Limpeza Automática

- **Quando:** Contexto > 70% ou Tokens > 40K
- **O que limpar:**
  - Arquivos antigos de memória (mais de 3 dias)
  - Logs antigos
  - Dependências não usadas
  - Temporary files

### 4. Estratégias de Limpeza

#### Limpeza de Memória (MEMORY.md)

```bash
# Listar arquivos de memória
ls -la memory/

# Remover arquivos antigos (mais de 3 dias)
find memory/ -name "*.md" -mtime +3 -delete

# Manter apenas os 3 mais recentes
ls -t memory/*.md | tail -n +4 | xargs rm
```

#### Limpeza de Logs

```bash
# Limpar logs antigos
find logs/ -name "*.log" -mtime +1 -delete

# Manter logs dos últimos 7 dias
find logs/ -name "*.log" -mtime +7 -delete
```

#### Limpeza de Dependências

```bash
# Remover node_modules de projetos não usados
find . -name "node_modules" -type d -prune -exec rm -rf {} \;
```

### 5. Monitoramento

#### Checar Status

```bash
# Ver contexto atual
session_status

# Ver tokens
openclaw status

# Ver memória
ls -lh memory/

# Ver logs
tail -f logs/*.log
```

#### Alertas

- **Contexto > 70%:** Aviso amarelo
- **Contexto > 80%:** Aviso vermelho (ação imediata)
- **Tokens > 40K:** Aviso amarelo
- **Tokens > 50K:** Aviso vermelho (ação imediata)

### 6. Regras de Arquivos

#### Arquivos de Memória (memory/)

- Manter apenas arquivos importantes
- Remover arquivos antigos (mais de 3 dias)
- Manter histórico de 7 dias no máximo
- Backup semanal para segurança

#### Arquivos de Log (logs/)

- Manter logs dos últimos 7 dias
- Remover logs antigos
- Compactar logs antigos (.log.gz)

#### Arquivos de Temporário (tmp/, temp/)

- Remover após uso
- Limpar automaticamente a cada 1 hora
- Manter máximo de 100MB

### 7. Exemplos de Uso

#### Exemplo 1: Limpeza Manual

```bash
# Limpar memória antiga
cd /root/projetos-kanban/veritas-kanban
find memory/ -name "*.md" -mtime +3 -delete

# Limpar logs antigos
find logs/ -name "*.log" -mtime +1 -delete

# Limpar node_modules
find . -name "node_modules" -type d -prune -exec rm -rf {} \;
```

#### Exemplo 2: Monitoramento Automático

```bash
# Script de monitoramento
while true; do
  context=$(session_status | jq '.context')
  if [ $context -gt 70 ]; then
    echo "⚠️  Contexto alto: $context%"
    # Limpar memória
  fi
  sleep 300
done
```

### 8. Checklist de Limpeza

- [ ] Verificar contexto atual
- [ ] Verificar tokens in/out
- [ ] Listar arquivos de memória
- [ ] Remover arquivos antigos (mais de 3 dias)
- [ ] Limpar logs antigos
- [ ] Remover node_modules não usados
- [ ] Limpar temporary files
- [ ] Verificar espaço em disco
- [ ] Commitar limpeza no git

### 9. Backup

#### Backup Semanal

```bash
# Backup de memória
tar -czf memory-backup-$(date +%Y%m%d).tar.gz memory/

# Backup de configurações
tar -czf config-backup-$(date +%Y%m%d).tar.gz openclaw.json

# Backup de logs
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/
```

#### Restaurar Backup

```bash
# Restaurar memória
tar -xzf memory-backup-20260217.tar.gz -C /root/projetos-kanban/veritas-kanban/
```

---

## Atualizações Recentes

### 2026-02-17 - Configuração Inicial

- Regras de contexto estabelecidas
- Limite: 80% contexto, 50K tokens
- Estratégias de limpeza definidas
- Checklist criado

---

**Última atualização:** 2026-02-17 23:50 UTC
**Status:** ✅ Configuração pronta
**Próxima verificação:** 2026-02-18 00:00 UTC
