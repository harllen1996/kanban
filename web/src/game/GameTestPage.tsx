/**
 * GameTestPage - Página de teste para a gamificação
 * Sprint 1: MVP Visual com dados de teste
 */

import { useState, useEffect } from 'react';
import { KanbanGame, TaskData } from '@/game';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Plus, Minus, Move } from 'lucide-react';
import { useView } from '@/contexts/ViewContext';

// Dados de exemplo mais ricos
const MOCK_TASKS: TaskData[] = [
  { id: '1', title: 'Implementar login', status: 'todo', priority: 'high', type: 'code' },
  { id: '2', title: 'Design da homepage', status: 'todo', priority: 'medium', type: 'design' },
  { id: '3', title: 'API de usuários', status: 'todo', priority: 'high', type: 'code' },
  { id: '4', title: 'Testes unitários', status: 'in-progress', priority: 'medium', type: 'code' },
  { id: '5', title: 'Corrigir bug checkout', status: 'in-progress', priority: 'high', type: 'bug' },
  { id: '6', title: 'Documentação API', status: 'in-progress', priority: 'low', type: 'doc' },
  {
    id: '7',
    title: 'Pesquisa de mercado',
    status: 'blocked',
    priority: 'medium',
    type: 'research',
  },
  { id: '8', title: 'Deploy produção', status: 'done', priority: 'high', type: 'code' },
  { id: '9', title: 'Configurar CI/CD', status: 'done', priority: 'medium', type: 'code' },
  { id: '10', title: 'Logo da marca', status: 'done', priority: 'low', type: 'design' },
];

export function GameTestPage() {
  const { setView } = useView();
  const [tasks, setTasks] = useState<TaskData[]>(MOCK_TASKS);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [autoMove, setAutoMove] = useState(false);

  // Auto-mover tarefas para demonstrar animação
  useEffect(() => {
    if (!autoMove) return;

    const interval = setInterval(() => {
      setTasks((prev) => {
        const newTasks = [...prev];
        const randomIndex = Math.floor(Math.random() * newTasks.length);
        const statuses: TaskData['status'][] = ['todo', 'in-progress', 'blocked', 'done'];
        newTasks[randomIndex] = {
          ...newTasks[randomIndex],
          status: statuses[Math.floor(Math.random() * statuses.length)],
        };
        return newTasks;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [autoMove]);

  const handleTaskClick = (taskId: string) => {
    setSelectedTask(taskId);
    console.log('Tarefa clicada:', taskId);
  };

  const handleAddTask = () => {
    const types = ['code', 'design', 'research', 'bug', 'doc'];
    const priorities = ['low', 'medium', 'high'];
    const newTask: TaskData = {
      id: `task-${Date.now()}`,
      title: `Tarefa ${tasks.length + 1}`,
      status: 'todo',
      priority: priorities[Math.floor(Math.random() * priorities.length)] as
        | 'low'
        | 'medium'
        | 'high',
      type: types[Math.floor(Math.random() * types.length)],
    };
    setTasks([...tasks, newTask]);
  };

  const handleRemoveTask = () => {
    if (tasks.length > 1) {
      setTasks(tasks.slice(0, -1));
    }
  };

  const handleReset = () => {
    setTasks(MOCK_TASKS);
    setSelectedTask(null);
  };

  const selectedTaskData = tasks.find((t) => t.id === selectedTask);

  const stats = {
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    blocked: tasks.filter((t) => t.status === 'blocked').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setView('board')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <h1 className="text-xl font-bold">🎮 Escritório Virtual</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoMove ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoMove(!autoMove)}
          >
            <Move className="h-4 w-4 mr-1" />
            {autoMove ? 'Parar' : 'Auto-mover'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRemoveTask}>
            <Minus className="h-4 w-4 mr-1" />
            Remover
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddTask}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Resetar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-card border rounded-lg p-3 text-center">
          <div className="text-2xl">🪑</div>
          <div className="text-2xl font-bold">{stats.todo}</div>
          <div className="text-xs text-muted-foreground">A Fazer</div>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center border-blue-500/30">
          <div className="text-2xl">💻</div>
          <div className="text-2xl font-bold text-blue-500">{stats.inProgress}</div>
          <div className="text-xs text-muted-foreground">Em Progresso</div>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center border-red-500/30">
          <div className="text-2xl">🚧</div>
          <div className="text-2xl font-bold text-red-500">{stats.blocked}</div>
          <div className="text-xs text-muted-foreground">Bloqueado</div>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center border-green-500/30">
          <div className="text-2xl">🎉</div>
          <div className="text-2xl font-bold text-green-500">{stats.done}</div>
          <div className="text-xs text-muted-foreground">Concluído</div>
        </div>
      </div>

      {/* Game Container */}
      <div className="h-[500px] border rounded-lg overflow-hidden">
        <KanbanGame tasks={tasks} onTaskClick={handleTaskClick} />
      </div>

      {/* Selected Task Details */}
      {selectedTaskData && (
        <div className="mt-4 p-4 bg-card border rounded-lg">
          <h2 className="font-semibold mb-2">📋 Tarefa Selecionada</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">ID:</span>
              <span className="ml-2 font-mono">{selectedTaskData.id}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Título:</span>
              <span className="ml-2">{selectedTaskData.title}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <span className="ml-2 capitalize">{selectedTaskData.status}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Prioridade:</span>
              <span
                className={`ml-2 ${selectedTaskData.priority === 'high' ? 'text-red-500' : selectedTaskData.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}
              >
                {selectedTaskData.priority}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm">
        <p className="font-semibold mb-2">📌 Instruções:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Clique nos personagens para ver detalhes da tarefa</li>
          <li>Use "Auto-mover" para ver animações automáticas</li>
          <li>Adicione/remova tarefas para testar o layout</li>
          <li>Personagens se movem automaticamente quando o status muda</li>
          <li>Cada cor indica prioridade: 🔴 alta, 🟡 média, 🟢 baixa</li>
        </ul>
      </div>
    </div>
  );
}

export default GameTestPage;
