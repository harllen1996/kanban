import { useState, useMemo } from 'react';
import { X, Trash2, Archive, ArrowRight, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useBulkActions } from '@/hooks/useBulkActions';
import { useDeleteTask, useBulkUpdate, useBulkArchiveByIds } from '@/hooks/useTasks';
import { useBulkDemote } from '@/hooks/useBacklog';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@veritas-kanban/shared';

const STATUS_BUTTONS: { id: TaskStatus; label: string; color: string; activeColor: string }[] = [
  {
    id: 'todo',
    label: 'A Fazer',
    color: 'border-slate-400 text-slate-600',
    activeColor: 'bg-slate-500 text-white border-slate-500',
  },
  {
    id: 'in-progress',
    label: 'Em Progresso',
    color: 'border-blue-400 text-blue-600',
    activeColor: 'bg-blue-500 text-white border-blue-500',
  },
  {
    id: 'blocked',
    label: 'Bloqueado',
    color: 'border-red-400 text-red-600',
    activeColor: 'bg-red-500 text-white border-red-500',
  },
  {
    id: 'done',
    label: 'Concluído',
    color: 'border-green-400 text-green-600',
    activeColor: 'bg-green-500 text-white border-green-500',
  },
];

interface BulkActionsBarProps {
  tasks: Task[];
}

export function BulkActionsBar({ tasks }: BulkActionsBarProps) {
  const { selectedIds, isSelecting, toggleSelecting, selectAll, toggleGroup, clearSelection } =
    useBulkActions();
  const { toast } = useToast();

  const bulkUpdate = useBulkUpdate();
  const deleteTask = useDeleteTask();
  const bulkArchiveByIds = useBulkArchiveByIds();
  const bulkDemote = useBulkDemote();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [moveTarget, setMoveTarget] = useState<TaskStatus | null>(null);

  // Group task IDs by status
  const taskIdsByStatus = useMemo(() => {
    const map: Record<TaskStatus, string[]> = {
      todo: [],
      'in-progress': [],
      blocked: [],
      done: [],
      cancelled: [],
    };
    for (const task of tasks) {
      if (map[task.status]) {
        map[task.status].push(task.id);
      }
    }
    return map;
  }, [tasks]);

  const allTaskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);
  const selectedCount = selectedIds.size;
  const allSelected = selectedCount === allTaskIds.length && allTaskIds.length > 0;

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll(allTaskIds);
    }
  };

  /** Check if all tasks of a given status are selected */
  const isStatusFullySelected = (status: TaskStatus): boolean => {
    const ids = taskIdsByStatus[status];
    return ids.length > 0 && ids.every((id) => selectedIds.has(id));
  };

  /** Check if some (but not all) tasks of a given status are selected */
  const isStatusPartiallySelected = (status: TaskStatus): boolean => {
    const ids = taskIdsByStatus[status];
    if (ids.length === 0) return false;
    const someSelected = ids.some((id) => selectedIds.has(id));
    const allSelectedInGroup = ids.every((id) => selectedIds.has(id));
    return someSelected && !allSelectedInGroup;
  };

  const handleMoveToStatus = async () => {
    if (!moveTarget) return;
    setIsProcessing(true);
    try {
      const ids = Array.from(selectedIds);
      // Type assertion since BulkActionsBar only allows the 4 valid statuses
      const result = await bulkUpdate.mutateAsync({
        ids,
        status: moveTarget as 'todo' | 'in-progress' | 'blocked' | 'done',
      });

      if (result.failed.length > 0) {
        toast({
          variant: 'default',
          title: 'Sucesso Parcial',
          description: `Movidas ${result.updated.length} de ${ids.length} tarefas. ${result.failed.length} falharam.`,
        });
      } else {
        toast({
          variant: 'default',
          title: 'Sucesso',
          description: `Movidas ${result.updated.length} tarefa${result.updated.length !== 1 ? 's' : ''}.`,
        });
      }

      clearSelection();
      setMoveTarget(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Falha ao Mover',
        description: 'Falha ao mover tarefas selecionadas.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchiveSelected = async () => {
    setIsProcessing(true);
    const taskIds = Array.from(selectedIds);

    try {
      const result = await bulkArchiveByIds.mutateAsync(taskIds);

      if (result.failed.length > 0 && result.archived.length > 0) {
        toast({
          variant: 'default',
          title: 'Arquivamento Parcial',
          description: `Arquivadas ${result.archived.length} de ${taskIds.length} tarefas. ${result.failed.length} falharam.`,
        });
      } else if (result.failed.length > 0) {
        toast({
          variant: 'destructive',
          title: 'Falha ao Arquivar',
          description: `Falha ao arquivar todas as ${taskIds.length} tarefas selecionadas.`,
        });
      } else {
        toast({
          variant: 'default',
          title: 'Sucesso',
          description: `Arquivadas ${result.archived.length} tarefa${result.archived.length !== 1 ? 's' : ''}.`,
        });
      }

      clearSelection();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Falha ao Arquivar',
        description: 'Falha ao arquivar tarefas selecionadas.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMoveToBacklog = async () => {
    setIsProcessing(true);
    const taskIds = Array.from(selectedIds);

    try {
      const result = await bulkDemote.mutateAsync(taskIds);

      if (result.failed.length > 0 && result.demoted.length > 0) {
        toast({
          variant: 'default',
          title: 'Sucesso Parcial',
          description: `Movidas ${result.demoted.length} de ${taskIds.length} tarefas para o backlog. ${result.failed.length} falharam.`,
        });
      } else if (result.failed.length > 0) {
        toast({
          variant: 'destructive',
          title: 'Falha ao Mover',
          description: `Falha ao mover todas as ${taskIds.length} tarefas selecionadas.`,
        });
      } else {
        toast({
          variant: 'default',
          title: 'Sucesso',
          description: `Movidas ${result.demoted.length} tarefa${result.demoted.length !== 1 ? 's' : ''} para o backlog.`,
        });
      }

      clearSelection();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Falha ao Mover',
        description: 'Falha ao mover tarefas selecionadas para o backlog.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteSelected = async () => {
    setIsProcessing(true);
    try {
      await Promise.all(Array.from(selectedIds).map((id) => deleteTask.mutateAsync(id)));
      clearSelection();
    } finally {
      setIsProcessing(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isSelecting) {
    return null;
  }

  return (
    <>
      <div
        className="flex items-center justify-between gap-4 mb-4 p-3 rounded-lg bg-muted/50 border"
        role="toolbar"
        aria-label="Ações em massa"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={toggleSelecting}>
            <X className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            aria-label={allSelected ? 'Desmarcar todas as tarefas' : 'Selecionar todas as tarefas'}
          >
            {allSelected ? 'Desmarcar Todas' : 'Selecionar Todas'}
          </Button>

          {/* Status filter buttons */}
          <div className="flex items-center gap-1.5 ml-1">
            {STATUS_BUTTONS.map(({ id, label, color, activeColor }) => {
              const count = taskIdsByStatus[id].length;
              if (count === 0) return null;
              const fullySelected = isStatusFullySelected(id);
              const partiallySelected = isStatusPartiallySelected(id);
              return (
                <Button
                  key={id}
                  variant="outline"
                  size="sm"
                  onClick={() => toggleGroup(taskIdsByStatus[id])}
                  className={cn(
                    'text-xs h-7 px-2 border transition-colors',
                    fullySelected ? activeColor : partiallySelected ? `${color} opacity-70` : color
                  )}
                  aria-label={`Selecionar todas as tarefas ${label} (${count})`}
                  aria-pressed={fullySelected}
                >
                  {label} ({count})
                </Button>
              );
            })}
          </div>

          <span className="text-sm text-muted-foreground ml-1">
            {selectedCount} selecionada{selectedCount !== 1 ? 's' : ''}
          </span>
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            {/* Move to status — two-step: pick target → confirm */}
            <Select
              value={moveTarget ?? ''}
              onValueChange={(value) => setMoveTarget(value as TaskStatus)}
              disabled={isProcessing}
            >
              <SelectTrigger className="w-[160px]">
                <div className="flex items-center gap-1">
                  <ArrowRight className="h-4 w-4" />
                  <span>
                    {moveTarget
                      ? (STATUS_BUTTONS.find((s) => s.id === moveTarget)?.label ?? 'Mover para...')
                      : 'Mover para...'}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">A Fazer</SelectItem>
                <SelectItem value="in-progress">Em Progresso</SelectItem>
                <SelectItem value="blocked">Bloqueado</SelectItem>
                <SelectItem value="done">Concluído</SelectItem>
              </SelectContent>
            </Select>

            {moveTarget && (
              <Button
                variant="default"
                size="sm"
                onClick={handleMoveToStatus}
                disabled={isProcessing}
              >
                <ArrowRight className="h-4 w-4 mr-1" />
                {isProcessing ? 'Movendo...' : 'Mover'}
              </Button>
            )}

            {/* Move to Backlog */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleMoveToBacklog}
              disabled={isProcessing}
            >
              <Inbox className="h-4 w-4 mr-1" />
              Para Backlog
            </Button>

            {/* Archive */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleArchiveSelected}
              disabled={isProcessing}
            >
              <Archive className="h-4 w-4 mr-1" />
              Arquivar
            </Button>

            {/* Delete */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isProcessing}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Excluir
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir {selectedCount} tarefa{selectedCount !== 1 ? 's' : ''}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. As tarefas selecionadas serão permanentemente
              excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
