/**
 * GatherGame Test Page - Visual Kanban Gather
 * Digital Twin gamificado da operação
 */

import { useState, useEffect } from 'react';
import { GatherGame, GatherTask, GatherAgent } from './GatherGame';

// Mock data para demonstração
const MOCK_AGENTS: GatherAgent[] = [
  {
    id: 'planner-1',
    name: 'Planner',
    role: 'planner',
    status: 'idle',
    current_task: null,
    position: { x: 0, y: 0 },
  },
  {
    id: 'analyst-1',
    name: 'Analyst',
    role: 'analyst',
    status: 'idle',
    current_task: null,
    position: { x: 0, y: 0 },
  },
  {
    id: 'developer-1',
    name: 'Developer 1',
    role: 'developer',
    status: 'idle',
    current_task: null,
    position: { x: 0, y: 0 },
  },
  {
    id: 'developer-2',
    name: 'Developer 2',
    role: 'developer',
    status: 'idle',
    current_task: null,
    position: { x: 0, y: 0 },
  },
  {
    id: 'qa-1',
    name: 'QA',
    role: 'qa',
    status: 'idle',
    current_task: null,
    position: { x: 0, y: 0 },
  },
  {
    id: 'ops-1',
    name: 'Ops',
    role: 'ops',
    status: 'idle',
    current_task: null,
    position: { x: 0, y: 0 },
  },
];

const MOCK_TASKS: GatherTask[] = [
  {
    id: 't1',
    title: 'Analisar gargalo last mile',
    description: 'SLA atrasado 5%',
    priority: 'high',
    status: 'backlog',
    assigned_agent: null,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 't2',
    title: 'Reposição emergencial',
    description: 'Estoque abaixo do mínimo',
    priority: 'critical',
    status: 'todo',
    assigned_agent: 'planner-1',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 't3',
    title: 'Otimizar rota reversa',
    description: 'Reduzir custos de logística',
    priority: 'medium',
    status: 'doing',
    assigned_agent: 'developer-1',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 't4',
    title: 'Implementar API de tracking',
    description: 'Integração com transportadoras',
    priority: 'high',
    status: 'doing',
    assigned_agent: 'developer-2',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 't5',
    title: 'Validar módulo de entregas',
    description: 'Testes de integração',
    priority: 'medium',
    status: 'review',
    assigned_agent: 'qa-1',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 't6',
    title: 'Deploy do sistema de notificações',
    description: 'Push notifications',
    priority: 'low',
    status: 'done',
    assigned_agent: 'ops-1',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export function GatherTestPage() {
  const [tasks, setTasks] = useState<GatherTask[]>(MOCK_TASKS);
  const [agents] = useState<GatherAgent[]>(MOCK_AGENTS);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [useRealData, setUseRealData] = useState(false);

  // Buscar tarefas reais da API
  useEffect(() => {
    if (useRealData) {
      fetch('/api/tasks')
        .then((res) => res.json())
        .then((data) => {
          const mappedTasks: GatherTask[] = data.map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description || '',
            priority: t.priority || 'medium',
            status: mapStatus(t.status),
            assigned_agent: t.assigned_agent || null,
            created_at: new Date(t.created_at || Date.now()),
            updated_at: new Date(t.updated_at || Date.now()),
          }));
          setTasks(mappedTasks);
        })
        .catch((err) => console.error('Erro ao buscar tarefas:', err));
    }
  }, [useRealData]);

  // Mapear status do Kanban para Gather
  const mapStatus = (status: string): GatherTask['status'] => {
    const map: Record<string, GatherTask['status']> = {
      todo: 'backlog',
      'in-progress': 'doing',
      blocked: 'review',
      done: 'done',
    };
    return map[status] || 'backlog';
  };

  // Simular movimento automático de tasks
  useEffect(() => {
    if (!simulationRunning) return;

    const interval = setInterval(() => {
      setTasks((prev) => {
        const newTasks = [...prev];
        const randomIndex = Math.floor(Math.random() * newTasks.length);
        const task = newTasks[randomIndex];

        // Avançar status
        const statusOrder: GatherTask['status'][] = ['backlog', 'todo', 'doing', 'review', 'done'];
        const currentIndex = statusOrder.indexOf(task.status);
        if (currentIndex < statusOrder.length - 1) {
          task.status = statusOrder[currentIndex + 1];
          task.updated_at = new Date();
        }

        return newTasks;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [simulationRunning]);

  // Handler para mover task
  const handleTaskMove = (taskId: string, newStatus: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: newStatus as GatherTask['status'], updated_at: new Date() }
          : t
      )
    );
  };

  // Estatísticas
  const stats = {
    total: tasks.length,
    backlog: tasks.filter((t) => t.status === 'backlog').length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    doing: tasks.filter((t) => t.status === 'doing').length,
    review: tasks.filter((t) => t.status === 'review').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">🏢 Visual Kanban Gather</h1>
            <p className="text-sm text-gray-400">Digital Twin gamificado da operação</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Toggle Simulação */}
            <button
              onClick={() => setSimulationRunning(!simulationRunning)}
              className={`px-4 py-2 rounded-lg font-medium ${
                simulationRunning
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {simulationRunning ? '▶️ Simulação Ativa' : '⏸️ Simulação Pausada'}
            </button>

            {/* Toggle Dados Reais */}
            <button
              onClick={() => setUseRealData(!useRealData)}
              className={`px-4 py-2 rounded-lg font-medium ${
                useRealData ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {useRealData ? '📡 Dados Reais' : '🎭 Dados Mock'}
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center gap-6 text-sm">
          <span>📊 Total: {stats.total}</span>
          <span>📋 Backlog: {stats.backlog}</span>
          <span>📝 To Do: {stats.todo}</span>
          <span>💻 Doing: {stats.doing}</span>
          <span>👥 Review: {stats.review}</span>
          <span>🎉 Done: {stats.done}</span>
        </div>
      </div>

      {/* Game Container */}
      <div className="flex-1 p-4">
        <GatherGame
          tasks={tasks}
          agents={agents}
          onTaskMove={handleTaskMove}
          onAgentClick={(id) => console.log('Agent clicked:', id)}
        />
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <span>⌨️ R: Resetar | S: Toggle Simulação</span>
          </div>
          <div className="flex items-center gap-4">
            <span>🤖 {agents.length} agentes ativos</span>
            <span>📦 {tasks.length} tarefas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default GatherTestPage;
