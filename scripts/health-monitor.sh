#!/bin/bash
# Script de monitoramento do Veritas Kanban
# Verifica saúde do servidor e reinicia se necessário

PROJECT_DIR="/root/projetos-kanban/veritas-kanban"
LOG_FILE="$PROJECT_DIR/logs/health-monitor.log"
INTERVAL_SECONDS=1800  # 30 minutos

mkdir -p "$PROJECT_DIR/logs"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

check_server() {
    # Verificar se o servidor está rodando
    if ! pgrep -f "pnpm dev" > /dev/null; then
        log "⚠️ Servidor não está rodando. Reiniciando..."
        cd "$PROJECT_DIR"
        pnpm dev >> "$PROJECT_DIR/logs/server.log" 2>&1 &
        sleep 10
        log "✅ Servidor reiniciado"
        return 1
    fi
    
    # Verificar se a API responde
    if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
        log "⚠️ API não responde. Verificando..."
        return 2
    fi
    
    # Verificar se o frontend responde
    if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
        log "⚠️ Frontend não responde. Verificando..."
        return 3
    fi
    
    log "✅ Tudo funcionando normalmente"
    return 0
}

# Loop principal
log "🚀 Iniciando monitoramento do Veritas Kanban"

while true; do
    check_server
    sleep $INTERVAL_SECONDS
done
