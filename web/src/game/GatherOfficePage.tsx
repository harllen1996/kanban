/**
 * Gather Office Test Page
 */

import { useState, useEffect } from 'react';
import { GatherOffice, OfficeTask, OfficeAgent } from './GatherOffice';

const MOCK_AGENTS: OfficeAgent[] = [
  {
    id: 'planner-1',
    name: 'Planner',
    role: 'planner',
    status: 'working',
    current_task: 't1',
    position: { x: 0, y: 0 },
  },
  {
    id: 'analyst-1',
    name: 'Analyst',
    role: 'analyst',
    status: 'working',
    current_task: 't2',
    position: { x: 0, y: 0 },
  },
  {
    id: 'dev-1',
    name: 'Dev 1',
    role: 'developer',
    status: 'working',
    current_task: 't3',
    position: { x: 0, y: 0 },
  },
  {
    id: 'dev-2',
    name: 'Dev 2',
    role: 'developer',
    status: 'working',
    current_task: 't4',
    position: { x: 0, y: 0 },
  },
  {
    id: 'qa-1',
    name: 'QA',
    role: 'qa',
    status: 'meeting',
    current_task: 't5',
    position: { x: 0, y: 0 },
  },
  {
    id: 'ops-1',
    name: 'Ops',
    role: 'ops',
    status: 'celebrating',
    current_task: 't6',
    position: { x: 0, y: 0 },
  },
];

const MOCK_TASKS: OfficeTask[] = [
  {
    id: 't1',
    title: 'Analisar gargalo',
    priority: 'high',
    status: 'backlog',
    assigned_agent: 'planner-1',
  },
  {
    id: 't2',
    title: 'Reposição estoque',
    priority: 'critical',
    status: 'todo',
    assigned_agent: 'analyst-1',
  },
  {
    id: 't3',
    title: 'API de tracking',
    priority: 'high',
    status: 'doing',
    assigned_agent: 'dev-1',
  },
  {
    id: 't4',
    title: 'Otimizar rotas',
    priority: 'medium',
    status: 'doing',
    assigned_agent: 'dev-2',
  },
  {
    id: 't5',
    title: 'Testes entrega',
    priority: 'medium',
    status: 'review',
    assigned_agent: 'qa-1',
  },
  { id: 't6', title: 'Deploy notif', priority: 'low', status: 'done', assigned_agent: 'ops-1' },
];

export function GatherOfficePage() {
  const [tasks, setTasks] = useState<OfficeTask[]>(MOCK_TASKS);
  const [agents] = useState<OfficeAgent[]>(MOCK_AGENTS);
  const [autoMode, setAutoMode] = useState(false);

  useEffect(() => {
    if (!autoMode) return;

    const interval = setInterval(() => {
      setTasks((prev) => {
        const newTasks = [...prev];
        const statusOrder = ['backlog', 'todo', 'doing', 'review', 'done'] as const;
        const randomIdx = Math.floor(Math.random() * newTasks.length);
        const task = newTasks[randomIdx];
        const currentIdx = statusOrder.indexOf(task.status);
        if (currentIdx < statusOrder.length - 1) {
          task.status = statusOrder[currentIdx + 1];
        }
        return newTasks;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [autoMode]);

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <header className="bg-gray-800 p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">🏢 Gather Office</h1>
          <p className="text-sm text-gray-400">Digital Twin - Escritório Virtual</p>
        </div>
        <button
          onClick={() => setAutoMode(!autoMode)}
          className={`px-4 py-2 rounded ${autoMode ? 'bg-green-600' : 'bg-gray-700'} text-white`}
        >
          {autoMode ? '▶️ Auto' : '⏸️ Manual'}
        </button>
      </header>
      <div className="flex-1">
        <GatherOffice tasks={tasks} agents={agents} />
      </div>
    </div>
  );
}

export default GatherOfficePage;
