#!/bin/bash
# Sistema de Auto-Retomada - Nunca Para
# Verifica a cada 30 minutos se está tudo funcionando e retoma se necessário

PROJECT_DIR="/root/projetos-kanban/veritas-kanban"
LOG_FILE="$PROJECT_DIR/logs/auto-resume.log"
CHECK_INTERVAL=1800  # 30 minutos

cd "$PROJECT_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Função para garantir que o servidor está rodando
ensure_server_running() {
    if ! pgrep -f "pnpm dev" > /dev/null; then
        log "⚠️ Servidor parado! Reiniciando..."
        pkill -f "pnpm dev" 2>/dev/null
        sleep 2
        cd "$PROJECT_DIR" && pnpm dev >> "$PROJECT_DIR/logs/server.log" 2>&1 &
        sleep 10
        log "✅ Servidor reiniciado"
        return 1
    fi
    
    # Verificar se está respondendo
    if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
        log "⚠️ Frontend não responde! Reiniciando..."
        pkill -f "pnpm dev" 2>/dev/null
        sleep 2
        cd "$PROJECT_DIR" && pnpm dev >> "$PROJECT_DIR/logs/server.log" 2>&1 &
        sleep 10
        log "✅ Frontend reiniciado"
        return 1
    fi
    
    return 0
}

# Função para verificar e commitar progresso
commit_progress() {
    cd "$PROJECT_DIR"
    
    # Verificar se há mudanças
    if ! git diff --quiet 2>/dev/null; then
        log "📝 Commitando progresso..."
        git add -A
        git commit -m "auto: Progresso Sprint $(date '+%H:%M')" 2>/dev/null
        git push origin develop 2>/dev/null
        log "✅ Progresso commitado"
    fi
}

# Função principal de trabalho contínuo
continuous_work() {
    log "🚀 Iniciando trabalho contínuo..."
    
    while true; do
        CURRENT_TIME=$(date +%s)
        
        # Verificar servidor
        ensure_server_running
        
        # Commitar progresso
        commit_progress
        
        # Log de heartbeat
        log "💓 Heartbeat - Sistema funcionando"
        
        # Aguardar 30 minutos
        sleep $CHECK_INTERVAL
    done
}

# Iniciar
log "🤖 Sistema de Auto-Retomada iniciado"
continuous_work
