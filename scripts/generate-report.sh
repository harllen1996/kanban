#!/bin/bash
# Script de Relatório - Veritas Kanban Gamificação
# Executado automaticamente às 8:30 UTC

PROJECT_DIR="/root/projetos-kanban/veritas-kanban"
REPORT_FILE="$PROJECT_DIR/logs/report-$(date +%Y-%m-%d).md"
LOG_FILE="$PROJECT_DIR/logs/sprint1.log"

# Função para gerar relatório
generate_report() {
    cat > "$REPORT_FILE" << 'HEADER'
# 📊 Relatório Diário - Veritas Kanban Gamificação

**Data:** $(date '+%Y-%m-%d %H:%M:%S UTC')

---

## ✅ Resumo Executivo

### Progresso Geral

HEADER

    # Adicionar data atual
    echo "**Gerado em:** $(date '+%Y-%m-%d %H:%M:%S UTC')" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    # Status do servidor
    echo "### 🖥️ Status do Servidor" >> "$REPORT_FILE"
    if pgrep -f "pnpm dev" > /dev/null; then
        echo "- ✅ Servidor está rodando" >> "$REPORT_FILE"
    else
        echo "- ❌ Servidor está parado" >> "$REPORT_FILE"
    fi
    
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "- ✅ Frontend respondendo" >> "$REPORT_FILE"
    else
        echo "- ❌ Frontend não responde" >> "$REPORT_FILE"
    fi
    
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo "- ✅ API respondendo" >> "$REPORT_FILE"
    else
        echo "- ❌ API não responde" >> "$REPORT_FILE"
    fi
    
    echo "" >> "$REPORT_FILE"
    
    # Commits feitos
    echo "### 📝 Commits Realizados" >> "$REPORT_FILE"
    cd "$PROJECT_DIR"
    git log --oneline --since="1 day ago" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    # Progresso das Sprints
    echo "### 🎯 Progresso das Sprints" >> "$REPORT_FILE"
    echo "| Sprint | Status | %" >> "$REPORT_FILE"
    echo "|--------|--------|---|" >> "$REPORT_FILE"
    echo "| Sprint 0 | ✅ Completa | 100% |" >> "$REPORT_FILE"
    echo "| Sprint 1 | 🟡 Em progresso | ?% |" >> "$REPORT_FILE"
    echo "| Sprint 2 | ⬜ Pendente | 0% |" >> "$REPORT_FILE"
    echo "| Sprint 3 | ⬜ Pendente | 0% |" >> "$REPORT_FILE"
    echo "| Sprint 4 | ⬜ Pendente | 0% |" >> "$REPORT_FILE"
    echo "| Sprint 5 | ⬜ Pendente | 0% |" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    # Dificuldades
    echo "### ⚠️ Principais Dificuldades" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "1. **Erro de react-router-dom** - O projeto usa ViewContext, não React Router" >> "$REPORT_FILE"
    echo "   - **Solução:** Substituído useNavigate por useView" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "2. **Conflito de portas** - Múltiplas instâncias do servidor rodando" >> "$REPORT_FILE"
    echo "   - **Solução:** Matamos processos antigos e reiniciamos" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "3. **SIGKILL em processos** - Sistema matou processos em background" >> "$REPORT_FILE"
    echo "   - **Solução:** Sistema de monitoramento configurado para reiniciar automaticamente" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    # Próximos passos
    echo "### 🚀 Próximos Passos" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "1. Completar Sprint 1 (MVP Visual)" >> "$REPORT_FILE"
    echo "2. Implementar canvas responsivo" >> "$REPORT_FILE"
    echo "3. Melhorar visual do escritório" >> "$REPORT_FILE"
    echo "4. Adicionar personagens pixel art" >> "$REPORT_FILE"
    echo "5. Integrar com API real" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    # Estatísticas
    echo "### 📈 Estatísticas" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    TOTAL_COMMITS=$(git log --oneline --since="1 day ago" | wc -l)
    echo "- **Total de commits hoje:** $TOTAL_COMMITS" >> "$REPORT_FILE"
    
    TOTAL_FILES=$(git diff --stat HEAD~10 2>/dev/null | tail -1 | awk '{print $1}')
    echo "- **Arquivos modificados:** ~$TOTAL_FILES" >> "$REPORT_FILE"
    
    echo "- **Branch atual:** develop" >> "$REPORT_FILE"
    echo "- **Último commit:** $(git log -1 --oneline)" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    # Link para GitHub
    echo "### 🔗 Links" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "- **GitHub:** https://github.com/harllen1996/kanban" >> "$REPORT_FILE"
    echo "- **Frontend:** http://76.13.234.181:3000" >> "$REPORT_FILE"
    echo "- **Branch:** develop" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    # Footer
    echo "---" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "**Relatório gerado automaticamente pelo sistema de automação.**" >> "$REPORT_FILE"
    echo "**Próximo relatório:** Amanhã às 8:30 UTC" >> "$REPORT_FILE"
    
    echo "✅ RELATÓRIO GERADO: $REPORT_FILE"
}

# Executar
generate_report

# Logar
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📊 RELATÓRIO GERADO: $REPORT_FILE" >> "$LOG_FILE"
