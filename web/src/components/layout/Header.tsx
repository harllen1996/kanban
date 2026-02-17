import {
  Plus,
  Settings,
  Search,
  ListOrdered,
  Archive,
  Inbox,
  Sun,
  Moon,
  FileText,
  Users,
  Workflow,
  Bot,
  Menu,
  Gamepad2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateTaskDialog } from '@/components/task/CreateTaskDialog';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { AgentControlDialog } from '@/components/agents/AgentControlDialog';
// ActivitySidebar removed — merged into ActivityFeed (GH-66)
// ArchiveSidebar removed — replaced with full-page ArchivePage
import { ChatPanel } from '@/components/chat/ChatPanel';
import { SquadChatPanel } from '@/components/chat/SquadChatPanel';
import { UserMenu } from './UserMenu';
import { WebSocketIndicator } from '@/components/shared/WebSocketIndicator';
import { useState, useCallback } from 'react';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useView } from '@/contexts/ViewContext';
import { useBacklogCount } from '@/hooks/useBacklog';
import { useTheme } from '@/hooks/useTheme';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function Header() {
  const [createOpen, setCreateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<string | undefined>();
  const [agentControlOpen, setAgentControlOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // activityOpen removed — sidebar merged into feed (GH-66)
  // archiveOpen removed — archive is now a full page view
  const [chatOpen, setChatOpen] = useState(false);
  const [squadChatOpen, setSquadChatOpen] = useState(false);
  const { setOpenCreateDialog, setOpenChatPanel } = useKeyboard();
  const { view, setView } = useView();
  const { data: backlogCount = 0 } = useBacklogCount();
  const { theme, setTheme } = useTheme();

  const openSecuritySettings = useCallback(() => {
    setSettingsTab('security');
    setSettingsOpen(true);
  }, []);

  // Register the create dialog and chat panel openers with keyboard context (refs, no useEffect needed)
  setOpenCreateDialog(() => setCreateOpen(true));
  setOpenChatPanel(() => setChatOpen(true));

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card" role="banner">
      <nav aria-label="Main navigation" className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
              onClick={() => window.location.reload()}
              aria-label="Refresh page"
              title="Refresh page"
            >
              <span className="text-xl" aria-hidden="true">
                ⚖️
              </span>
              <h1 className="text-lg font-semibold">Veritas Kanban</h1>
            </button>
            <div className="h-4 w-px bg-border" aria-hidden="true" />
            <WebSocketIndicator />
          </div>

          {/* Desktop toolbar */}
          <div
            className="hidden md:flex items-center gap-2"
            role="toolbar"
            aria-label="Board actions"
          >
            <Button variant="default" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
              Nova Tarefa
            </Button>
            <Button
              variant={view === 'activity' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setView(view === 'activity' ? 'board' : 'activity')}
              aria-label="Atividades"
              title="Atividades"
            >
              <ListOrdered className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant={view === 'backlog' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setView(view === 'backlog' ? 'board' : 'backlog')}
              aria-label="Backlog"
              title="Backlog"
              className="relative"
            >
              <Inbox className="h-4 w-4" aria-hidden="true" />
              {backlogCount > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
                >
                  {backlogCount > 99 ? '99+' : backlogCount}
                </Badge>
              )}
            </Button>
            <Button
              variant={view === 'archive' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setView(view === 'archive' ? 'board' : 'archive')}
              aria-label="Arquivo"
              title="Arquivo"
            >
              <Archive className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant={view === 'templates' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setView(view === 'templates' ? 'board' : 'templates')}
              aria-label="Modelos"
              title="Modelos"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant={view === 'workflows' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setView(view === 'workflows' ? 'board' : 'workflows')}
              aria-label="Workflows"
              title="Workflows"
            >
              <Workflow className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSquadChatOpen(true)}
              aria-label="Chat da Equipe"
              title="Chat da Equipe — Comunicação dos agentes"
            >
              <Users className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAgentControlOpen(true)}
              aria-label="Controle de Agentes"
              title="Controle de Agentes"
            >
              <Bot className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView('game-test')}
              aria-label="Jogo"
              title="Jogo Gamificado"
            >
              <Gamepad2 className="h-4 w-4" aria-hidden="true" />
            </Button>
            {/* Botão de menu mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menu"
              title="Menu"
              className="mobile-menu-btn"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              aria-label="Configurações"
              title="Configurações"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Alternar tema"
              title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Sun className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
            <UserMenu onOpenSecuritySettings={openSecuritySettings} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
              }
              aria-label="Command palette"
              title="Command palette (⌘K)"
              className="gap-1.5 text-muted-foreground"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px]">
                ⌘K
              </kbd>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Button variant="default" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
              Nova
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menu"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile menu modal */}
      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Menu</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setMobileMenuOpen(false);
                setView(view === 'activity' ? 'board' : 'activity');
              }}
              className="justify-start"
            >
              <ListOrdered className="h-4 w-4 mr-2" />
              Atividades
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setMobileMenuOpen(false);
                setView(view === 'backlog' ? 'board' : 'backlog');
              }}
              className="justify-start"
            >
              <Inbox className="h-4 w-4 mr-2" />
              Backlog
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setMobileMenuOpen(false);
                setView(view === 'archive' ? 'board' : 'archive');
              }}
              className="justify-start"
            >
              <Archive className="h-4 w-4 mr-2" />
              Arquivo
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setMobileMenuOpen(false);
                setView(view === 'templates' ? 'board' : 'templates');
              }}
              className="justify-start"
            >
              <FileText className="h-4 w-4 mr-2" />
              Modelos
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setMobileMenuOpen(false);
                setView(view === 'workflows' ? 'board' : 'workflows');
              }}
              className="justify-start"
            >
              <Workflow className="h-4 w-4 mr-2" />
              Workflows
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setMobileMenuOpen(false);
                setAgentControlOpen(true);
              }}
              className="justify-start"
            >
              <Bot className="h-4 w-4 mr-2" />
              Agentes
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setMobileMenuOpen(false);
                setSettingsOpen(true);
              }}
              className="justify-start"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CreateTaskDialog open={createOpen} onOpenChange={setCreateOpen} />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={(open) => {
          setSettingsOpen(open);
          if (!open) setSettingsTab(undefined);
        }}
        defaultTab={settingsTab}
      />
      <ChatPanel open={chatOpen} onOpenChange={setChatOpen} />
      <SquadChatPanel open={squadChatOpen} onOpenChange={setSquadChatOpen} />
      <AgentControlDialog open={agentControlOpen} onOpenChange={setAgentControlOpen} />
    </header>
  );
}
