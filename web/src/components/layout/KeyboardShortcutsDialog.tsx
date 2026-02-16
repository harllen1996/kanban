import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useKeyboard } from '@/hooks/useKeyboard';

interface Shortcut {
  keys: string[];
  description: string;
}

const shortcuts: { category: string; items: Shortcut[] }[] = [
  {
    category: 'Navegação',
    items: [
      { keys: ['j', '↓'], description: 'Selecionar próxima tarefa' },
      { keys: ['k', '↑'], description: 'Selecionar tarefa anterior' },
      { keys: ['Enter'], description: 'Abrir tarefa selecionada' },
      { keys: ['Esc'], description: 'Fechar painel / Limpar seleção' },
    ],
  },
  {
    category: 'Ações',
    items: [
      { keys: ['c'], description: 'Criar nova tarefa' },
      { keys: ['⌘⇧C'], description: 'Abrir chat do agente' },
      { keys: ['1'], description: 'Mover para A Fazer' },
      { keys: ['2'], description: 'Mover para Planejamento' },
      { keys: ['3'], description: 'Mover para Em Progresso' },
      { keys: ['4'], description: 'Mover para Bloqueado' },
      { keys: ['5'], description: 'Mover para Concluído' },
    ],
  },
  {
    category: 'Geral',
    items: [{ keys: ['?'], description: 'Mostrar/ocultar esta ajuda' }],
  },
];

function KeyBadge({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-medium bg-muted border border-border rounded shadow-sm">
      {children}
    </kbd>
  );
}

export function KeyboardShortcutsDialog() {
  const { isHelpOpen, closeHelpDialog } = useKeyboard();

  return (
    <Dialog open={isHelpOpen} onOpenChange={(open) => !open && closeHelpDialog()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">⌨️ Atalhos de Teclado</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {shortcuts.map((section) => (
            <section key={section.category} aria-label={`Atalhos de ${section.category}`}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {section.category}
              </h3>
              <dl className="space-y-2">
                {section.items.map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <dt className="text-sm">{shortcut.description}</dt>
                    <dd className="flex items-center gap-1">
                      {shortcut.keys.map((key, j) => (
                        <span key={j} className="flex items-center gap-1">
                          {j > 0 && (
                            <span className="text-muted-foreground text-xs" aria-hidden="true">
                              ou
                            </span>
                          )}
                          <KeyBadge>{key}</KeyBadge>
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Pressione <KeyBadge>?</KeyBadge> a qualquer momento para mostrar esta ajuda
        </div>
      </DialogContent>
    </Dialog>
  );
}
