/**
 * AgentControlDialog - Menu para criar/controlar agentes 24h
 *
 * Funcionalidades:
 * - Listar agentes registrados
 * - Criar novos agentes
 * - Excluir agentes
 * - Ver status em tempo real
 * - Manter agentes online 24h
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Bot,
  Plus,
  Trash2,
  Power,
  PowerOff,
  RefreshCw,
  Activity,
  Clock,
  Cpu,
  Terminal,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────

interface RegisteredAgent {
  id: string;
  name: string;
  model?: string;
  provider?: string;
  capabilities: { name: string; description?: string }[];
  status: 'online' | 'busy' | 'idle' | 'offline';
  registeredAt: string;
  lastHeartbeat: string;
  currentTaskId?: string;
  currentTaskTitle?: string;
  sessionKey?: string;
}

interface AgentControlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Agent Card Component ────────────────────────────────────────

function AgentCard({
  agent,
  onDelete,
  onToggle,
}: {
  agent: RegisteredAgent;
  onDelete: (id: string) => void;
  onToggle: (id: string, status: string) => void;
}) {
  const isOnline = agent.status === 'online' || agent.status === 'busy';
  const isBusy = agent.status === 'busy';

  const statusColors = {
    online: 'bg-green-500',
    busy: 'bg-blue-500',
    idle: 'bg-yellow-500',
    offline: 'bg-gray-500',
  };

  const statusLabels = {
    online: 'Online',
    busy: 'Ocupado',
    idle: 'Inativo',
    offline: 'Offline',
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="h-8 w-8 text-primary" />
            <div
              className={cn(
                'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card',
                statusColors[agent.status]
              )}
            />
          </div>
          <div>
            <h3 className="font-semibold">{agent.name}</h3>
            <p className="text-xs text-muted-foreground">{agent.id}</p>
          </div>
        </div>
        <Badge variant={isOnline ? 'default' : 'secondary'}>{statusLabels[agent.status]}</Badge>
      </div>

      {agent.model && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Cpu className="h-3 w-3" />
          <span>{agent.model}</span>
          {agent.provider && <span className="text-xs">({agent.provider})</span>}
        </div>
      )}

      {agent.capabilities.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {agent.capabilities.map((cap, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {cap.name}
            </Badge>
          ))}
        </div>
      )}

      {agent.currentTaskTitle && (
        <div className="flex items-center gap-2 text-sm">
          <Activity className="h-3 w-3 text-blue-500" />
          <span className="truncate">{agent.currentTaskTitle}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            {isOnline
              ? 'Online'
              : `Último heartbeat: ${new Date(agent.lastHeartbeat).toLocaleTimeString('pt-BR')}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(agent.id, agent.status)}
            title={isOnline ? 'Desligar' : 'Ligar'}
          >
            {isOnline ? (
              <PowerOff className="h-4 w-4 text-orange-500" />
            ) : (
              <Power className="h-4 w-4 text-green-500" />
            )}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" title="Excluir">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir agente?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o agente "{agent.name}"? Esta ação não pode ser
                  desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(agent.id)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

// ─── Create Agent Form ────────────────────────────────────────────

function CreateAgentForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [model, setModel] = useState('claude-sonnet-4');
  const [capabilities, setCapabilities] = useState<string[]>(['code']);
  const [isCreating, setIsCreating] = useState(false);

  const availableModels = [
    { id: 'claude-sonnet-4', name: 'Claude Sonnet 4' },
    { id: 'claude-opus-4', name: 'Claude Opus 4' },
    { id: 'gpt-4.5', name: 'GPT-4.5' },
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'llama-3.3-70b', name: 'LLaMA 3.3 70B' },
    { id: 'glm-4.7-flash', name: 'GLM-4.7 Flash' },
    { id: 'glm-5', name: 'GLM-5' },
  ];

  const availableCapabilities = [
    { id: 'code', name: 'Código', description: 'Desenvolvimento e edição de código' },
    { id: 'research', name: 'Pesquisa', description: 'Busca e análise de informações' },
    { id: 'deploy', name: 'Deploy', description: 'Implantação e infraestrutura' },
    { id: 'review', name: 'Revisão', description: 'Code review e qualidade' },
    { id: 'test', name: 'Testes', description: 'Criação e execução de testes' },
    { id: 'docs', name: 'Documentação', description: 'Escrita de documentação' },
  ];

  const handleCreate = async () => {
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/registry/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          model,
          capabilities: capabilities.map((c) => ({
            name: c,
            description: availableCapabilities.find((ac) => ac.id === c)?.description,
          })),
          keepAlive: true, // Manter online 24h
        }),
      });

      if (response.ok) {
        setName('');
        setCapabilities(['code']);
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao criar agente:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleCapability = (capId: string) => {
    setCapabilities((prev) =>
      prev.includes(capId) ? prev.filter((c) => c !== capId) : [...prev, capId]
    );
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Sparkles className="h-4 w-4 text-primary" />
        <span>Criar Novo Agente</span>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="agent-name">Nome do Agente</Label>
          <Input
            id="agent-name"
            placeholder="Ex: Assistente de Código"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Modelo</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Capacidades</Label>
          <div className="flex flex-wrap gap-2">
            {availableCapabilities.map((cap) => (
              <Badge
                key={cap.id}
                variant={capabilities.includes(cap.id) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleCapability(cap.id)}
              >
                {cap.name}
              </Badge>
            ))}
          </div>
        </div>

        <Button onClick={handleCreate} disabled={!name.trim() || isCreating} className="w-full">
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Criar Agente
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Dialog Component ────────────────────────────────────────

export function AgentControlDialog({ open, onOpenChange }: AgentControlDialogProps) {
  const queryClient = useQueryClient();

  // Fetch registered agents
  const {
    data: agents = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['registered-agents'],
    queryFn: async () => {
      const response = await fetch('/api/registry/agents');
      if (!response.ok) return [];
      const result = await response.json();
      // API retorna { success: true, data: [...] }
      return (result.data || result) as RegisteredAgent[];
    },
    refetchInterval: 5000, // Atualizar a cada 5 segundos
  });

  // Delete agent mutation
  const deleteMutation = useMutation({
    mutationFn: async (agentId: string) => {
      const response = await fetch(`/api/registry/agents/${agentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Falha ao excluir');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registered-agents'] });
    },
  });

  // Toggle agent status mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ agentId, currentStatus }: { agentId: string; currentStatus: string }) => {
      const newStatus = currentStatus === 'offline' ? 'online' : 'offline';
      const response = await fetch(`/api/registry/agents/${agentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Falha ao atualizar status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registered-agents'] });
    },
  });

  const handleDelete = (agentId: string) => {
    deleteMutation.mutate(agentId);
  };

  const handleToggle = (agentId: string, currentStatus: string) => {
    toggleMutation.mutate({ agentId, currentStatus });
  };

  const onlineCount = agents.filter((a) => a.status === 'online' || a.status === 'busy').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Controle de Agentes
          </DialogTitle>
          <DialogDescription>Crie e gerencie agentes que ficam online 24 horas.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Summary */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm">{onlineCount} online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500" />
                <span className="text-sm">{agents.length - onlineCount} offline</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Atualizar
            </Button>
          </div>

          {/* Create Agent Form */}
          <CreateAgentForm onSuccess={() => refetch()} />

          {/* Agents List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Agentes Registrados ({agents.length})
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : agents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum agente registrado</p>
                <p className="text-xs">Crie um novo agente acima</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
