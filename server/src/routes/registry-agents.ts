/**
 * Registry Agents Routes - API para gerenciar agentes 24h
 *
 * Endpoints:
 * GET    /api/registry/agents        - Lista todos os agentes
 * POST   /api/registry/agents        - Cria novo agente
 * GET    /api/registry/agents/:id    - Busca agente por ID
 * PATCH  /api/registry/agents/:id    - Atualiza agente
 * DELETE /api/registry/agents/:id    - Remove agente
 * PATCH  /api/registry/agents/:id/status - Atualiza status
 * POST   /api/registry/agents/:id/heartbeat - Heartbeat do agente
 */

import { Router } from 'express';
import { getAgentRegistryService } from '../services/agent-registry-service.js';
import { createLogger } from '../lib/logger.js';

const log = createLogger('registry-agents');
const router = Router();

// ─── GET /api/registry/agents - Listar todos ──────────────────────

router.get('/', async (req, res) => {
  try {
    const registry = getAgentRegistryService();
    const agents = await registry.list(); // Sem filtros, retorna todos
    res.json(agents);
  } catch (error) {
    log.error('Erro ao listar agentes:', error);
    res.status(500).json({ error: 'Erro ao listar agentes' });
  }
});

// ─── POST /api/registry/agents - Criar agente ─────────────────────

router.post('/', async (req, res) => {
  try {
    const { name, model, provider, capabilities, sessionKey, keepAlive } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const id = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const registration = {
      id,
      name: name.trim(),
      model: model || 'default',
      provider: provider || 'auto',
      capabilities: capabilities || [{ name: 'general', description: 'Uso geral' }],
      sessionKey,
    };

    const registry = getAgentRegistryService();
    const agent = await registry.registerAgent(registration);

    log.info(`Agente criado: ${agent.name} (${agent.id})`);

    // Se keepAlive está ativo, iniciar heartbeat automático
    if (keepAlive) {
      // Heartbeat a cada 2 minutos para manter online
      const heartbeatInterval = setInterval(
        async () => {
          try {
            await registry.heartbeat(agent.id, { status: 'online' });
          } catch (e) {
            log.warn(`Heartbeat falhou para ${agent.id}:`, e);
            clearInterval(heartbeatInterval);
          }
        },
        2 * 60 * 1000
      );

      // Armazenar interval para limpeza depois
      (agent as any)._heartbeatInterval = heartbeatInterval;
    }

    res.status(201).json({ success: true, agent });
  } catch (error) {
    log.error('Erro ao criar agente:', error);
    res.status(500).json({ error: 'Erro ao criar agente' });
  }
});

// ─── GET /api/registry/agents/:id - Buscar por ID ─────────────────

router.get('/:id', async (req, res) => {
  try {
    const registry = getAgentRegistryService();
    const agent = await registry.getAgent(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agente não encontrado' });
    }
    res.json(agent);
  } catch (error) {
    log.error('Erro ao buscar agente:', error);
    res.status(500).json({ error: 'Erro ao buscar agente' });
  }
});

// ─── PATCH /api/registry/agents/:id - Atualizar agente ────────────

router.patch('/:id', async (req, res) => {
  try {
    const { name, model, provider, capabilities } = req.body;
    const updates: any = {};

    if (name) updates.name = name;
    if (model) updates.model = model;
    if (provider) updates.provider = provider;
    if (capabilities) updates.capabilities = capabilities;

    const registry = getAgentRegistryService();
    const agent = await registry.updateAgent(req.params.id, updates);
    if (!agent) {
      return res.status(404).json({ error: 'Agente não encontrado' });
    }

    log.info(`Agente atualizado: ${agent.name} (${agent.id})`);
    res.json({ success: true, agent });
  } catch (error) {
    log.error('Erro ao atualizar agente:', error);
    res.status(500).json({ error: 'Erro ao atualizar agente' });
  }
});

// ─── DELETE /api/registry/agents/:id - Remover agente ─────────────

router.delete('/:id', async (req, res) => {
  try {
    const registry = getAgentRegistryService();
    const agent = await registry.getAgent(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agente não encontrado' });
    }

    await registry.unregisterAgent(req.params.id);

    log.info(`Agente removido: ${agent.name} (${agent.id})`);
    res.json({ success: true, message: `Agente "${agent.name}" removido` });
  } catch (error) {
    log.error('Erro ao remover agente:', error);
    res.status(500).json({ error: 'Erro ao remover agente' });
  }
});

// ─── PATCH /api/registry/agents/:id/status - Atualizar status ────

router.patch('/:id/status', async (req, res) => {
  try {
    const { status, currentTaskId, currentTaskTitle } = req.body;

    if (!['online', 'busy', 'idle', 'offline'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const registry = getAgentRegistryService();
    const agent = await registry.heartbeat(req.params.id, {
      status,
      currentTaskId,
      currentTaskTitle,
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agente não encontrado' });
    }

    log.info(`Status do agente ${agent.id} atualizado para: ${status}`);
    res.json({ success: true, agent });
  } catch (error) {
    log.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// ─── POST /api/registry/agents/:id/heartbeat - Heartbeat ──────────

router.post('/:id/heartbeat', async (req, res) => {
  try {
    const { status, currentTaskId, currentTaskTitle, metadata } = req.body;

    const registry = getAgentRegistryService();
    const agent = await registry.heartbeat(req.params.id, {
      status,
      currentTaskId,
      currentTaskTitle,
      metadata,
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agente não encontrado' });
    }

    res.json({ success: true, timestamp: agent.lastHeartbeat });
  } catch (error) {
    log.error('Erro no heartbeat:', error);
    res.status(500).json({ error: 'Erro no heartbeat' });
  }
});

export default router;
