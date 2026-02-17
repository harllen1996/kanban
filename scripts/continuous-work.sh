#!/bin/bash
# Script de trabalho contínuo - Sprint 1
# Continua automaticamente as tarefas da gamificação

PROJECT_DIR="/root/projetos-kanban/veritas-kanban"
LOG_FILE="$PROJECT_DIR/logs/sprint1.log"
cd "$PROJECT_DIR"

# Função para logar
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Função para verificar saúde do servidor
check_health() {
    if ! pgrep -f "pnpm dev" > /dev/null; then
        log "⚠️ SERVIDOR PARADO - Reiniciando..."
        pkill -f "pnpm dev"
        pnpm dev >> "$PROJECT_DIR/logs/server.log" 2>&1 &
        sleep 15
        log "✅ SERVIDOR REINICIADO"
        return 1
    fi

    if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
        log "⚠️ API NÃO RESPONDE - Reiniciando..."
        pkill -f "pnpm dev"
        pnpm dev >> "$PROJECT_DIR/logs/server.log" 2>&1 &
        sleep 15
        log "✅ API REINICIADA"
        return 1
    fi

    if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
        log "⚠️ FRONTEND NÃO RESPONDE - Reiniciando..."
        pkill -f "pnpm dev"
        pnpm dev >> "$PROJECT_DIR/logs/server.log" 2>&1 &
        sleep 15
        log "✅ FRONTEND REINICIADO"
        return 1
    fi

    return 0
}

# Função para executar tarefas da Sprint 1
do_sprint1_tasks() {
    log "🚀 INICIANDO TAREFAS SPRINT 1"

    # Tarefa 1.1: Melhorar canvas e responsividade
    log "📝 Tarefa 1.1: Melhorando canvas..."
    # TODO: Implementar resize automático no Phaser

    # Tarefa 1.2: Desenhar salas do escritório
    log "📝 Tarefa 1.2: Desenhando salas..."
    # TODO: Melhorar visual do drawOffice()

    # Tarefa 1.3: Renderizar personagens
    log "📝 Tarefa 1.3: Renderizando personagens..."
    # TODO: Adicionar sprites e animações

    # Tarefa 1.4: Mapear tarefas para posições
    log "📝 Tarefa 1.4: Mapeando tarefas..."
    # TODO: Implementar grid layout

    # Tarefa 1.5: Integrar com dados do Kanban
    log "📝 Tarefa 1.5: Integrando com API..."
    # TODO: Conectar com WebSocket

    log "✅ TAREFAS SPRINT 1 COMPLETAS"
}

# Loop principal
log "🤖 INICIANDO TRABALHO CONTÍNUO SPRINT 1"

while true; do
    # Verificar saúde
    check_health

    # Executar tarefas da Sprint 1
    do_sprint1_tasks

    # Aguardar 20 minutos
    log "⏸️ Aguardando 20 minutos..."
    sleep 1200
done
