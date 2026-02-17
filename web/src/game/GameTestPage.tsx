/**
 * GameTestPage - Página de teste para a gamificação
 *
 * Página isolada para testar o jogo sem afetar o Kanban principal.
 * Rota: /game-test
 */

import { useState, useEffect } from 'react';
import { KanbanGame, TaskData } from '@/game';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Dados de exemplo para teste
const MOCK_TASKS: TaskData[] = [
  { id: '1', title: 'Implementar login', status: 'todo', priority: 'high', type: 'code' },
  { id: '2', title: 'Design da homepage', status: 'todo', priority: 'medium', type: 'design' },
  { id: '3', title: 'API de usuários', status: 'in-progress', priority: 'high', type: 'code' },
  { id: '4', title: 'Testes unitários', status: 'in-progress', priority: 'medium', type: 'code' },
  { id: '5', title: 'Bug no checkout', status: 'blocked', priority: 'high', type: 'code' },
  { id: '6', title: 'Documentação', status: 'done', priority: 'low', type: 'default' },
  { id: '7', title: 'Deploy produção', status: 'done', priority: 'high', type: 'code' },
];

export function GameTestPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskData[]>(MOCK_TASKS);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // Atualizar tarefas periodicamente para simular mudanças
  useEffect(() => {
    const interval = setInterval(() => {
      // Mover uma tarefa aleatória para outro status (simulação)
      const randomIndex = Math.floor(Math.random() * tasks.length);
      const statuses: TaskData['status'][] = ['todo', 'in-progress', 'blocked', 'done'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      setTasks((prev) =>
        prev.map((task, i) => (i === randomIndex ? { ...task, status: randomStatus } : task))
      );
    }, 10000); // A cada 10 segundos

    return () => clearInterval(interval);
  }, [tasks.length]);

  const handleTaskClick = (taskId: string) => {
    setSelectedTask(taskId);
    console.log('Tarefa clicada:', taskId);
  };

  const handleAddTask = () => {
    const newTask: TaskData = {
      id: `task-${Date.now()}`,
      title: `Tarefa ${tasks.length + 1}`,
      status: 'todo',
      priority: 'medium',
      type: 'default',
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

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar ao Kanban
          </Button>
          <h1 className="text-xl font-bold">🎮 Teste de Gamificação</h1>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Info */}
      <div className="bg-muted/50 rounded-lg p-3 mb-4 text-sm">
        <p>
          <strong>📌 Sprint 0 - Teste:</strong> Personagens representam tarefas. Clique neles para
          selecionar. Tarefas mudam automaticamente a cada 10s para simular atividade.
        </p>
        <p className="mt-1 text-muted-foreground">
          Total de tarefas: <strong>{tasks.length}</strong> | Selecionada:{' '}
          <strong>{selectedTaskData?.title || 'Nenhuma'}</strong>
        </p>
      </div>

      {/* Game Container */}
      <div className="h-[600px] border rounded-lg overflow-hidden">
        <KanbanGame tasks={tasks} onTaskClick={handleTaskClick} />
      </div>

      {/* Task Details */}
      {selectedTaskData && (
        <div className="mt-4 p-4 bg-card border rounded-lg">
          <h2 className="font-semibold mb-2">Tarefa Selecionada</h2>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">ID:</span> {selectedTaskData.id}
            </div>
            <div>
              <span className="text-muted-foreground">Título:</span> {selectedTaskData.title}
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span> {selectedTaskData.status}
            </div>
            <div>
              <span className="text-muted-foreground">Prioridade:</span> {selectedTaskData.priority}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 p-4 bg-card border rounded-lg">
        <h3 className="font-semibold mb-2">Legenda</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#2d3436]" />
            <span>🪑 Sala de Espera (A Fazer)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#0984e3]/30" />
            <span>💻 Área de Trabalho (Em Progresso)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#d63031]/30" />
            <span>🚧 Zona Bloqueada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#00b894]/30" />
            <span>🎉 Área de Sucesso (Concluído)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameTestPage;
