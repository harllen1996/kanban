import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Lock, Key, Check, Copy, Download } from 'lucide-react';

export function LoginScreen() {
  const { login, recover } = useAuth();
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recovery mode state
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // New recovery key display
  const [newRecoveryKey, setNewRecoveryKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [savedConfirmed, setSavedConfirmed] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const result = await login(password, rememberMe);

    if (!result.success) {
      setError(result.error || 'Senha inválida');
    }

    setIsSubmitting(false);
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryKey || !newPassword || newPassword !== confirmNewPassword || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const result = await recover(recoveryKey, newPassword);

    if (result.success && result.recoveryKey) {
      setNewRecoveryKey(result.recoveryKey);
    } else {
      setError(result.error || 'Falha na recuperação');
    }

    setIsSubmitting(false);
  };

  const copyRecoveryKey = async () => {
    if (!newRecoveryKey) return;
    await navigator.clipboard.writeText(newRecoveryKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const downloadRecoveryKey = () => {
    if (!newRecoveryKey) return;
    const blob = new Blob(
      [
        `Chave de Recuperação Veritas Kanban\n\nSua chave de recuperação: ${newRecoveryKey}\n\nGuarde este arquivo com segurança! Você precisará dele se esquecer sua senha.\n\nGerado em: ${new Date().toISOString()}`,
      ],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'veritas-kanban-chave-recuperacao.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Show new recovery key after successful password reset
  if (newRecoveryKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mb-4">
              <Key className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">Senha Redefinida com Sucesso</h1>
            <p className="text-muted-foreground">
              Salve sua nova chave de recuperação - você precisará dela se esquecer sua senha
              novamente.
            </p>
          </div>

          <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-3">
            <div className="font-mono text-xl text-center tracking-wider py-2">
              {newRecoveryKey}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={copyRecoveryKey}>
                {copiedKey ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copiedKey ? 'Copiado!' : 'Copiar'}
              </Button>
              <Button variant="outline" className="flex-1" onClick={downloadRecoveryKey}>
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <Checkbox
              id="saved-confirm"
              checked={savedConfirmed}
              onCheckedChange={(checked) => setSavedConfirmed(!!checked)}
            />
            <Label htmlFor="saved-confirm" className="text-sm cursor-pointer">
              Salvei minha chave de recuperação em um local seguro
            </Label>
          </div>

          <Button
            className="w-full"
            disabled={!savedConfirmed}
            onClick={() => window.location.reload()}
          >
            Continuar para o App
          </Button>
        </div>
      </div>
    );
  }

  // Recovery mode
  if (showRecovery) {
    const passwordsMatch = newPassword === confirmNewPassword;
    const isValid = recoveryKey && newPassword.length >= 8 && passwordsMatch;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 mb-4">
              <Key className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">Redefinir Senha</h1>
            <p className="text-muted-foreground">
              Digite sua chave de recuperação e uma nova senha.
            </p>
          </div>

          <form onSubmit={handleRecover} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recovery-key">Chave de Recuperação</Label>
              <Input
                id="recovery-key"
                type="text"
                value={recoveryKey}
                onChange={(e) => setRecoveryKey(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="font-mono tracking-wider"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha (8+ caracteres)"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-new-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirme a nova senha"
              />
              {confirmNewPassword && !passwordsMatch && (
                <p className="text-xs text-destructive">As senhas não coincidem</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
              {isSubmitting ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>

            <button
              type="button"
              onClick={() => {
                setShowRecovery(false);
                setError(null);
              }}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              Voltar para o login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Bem-vindo de Volta</h1>
          <p className="text-muted-foreground">Digite sua senha para acessar o Veritas Kanban.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="pr-10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(!!checked)}
            />
            <Label htmlFor="remember-me" className="text-sm cursor-pointer">
              Lembrar de mim por 30 dias
            </Label>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={!password || isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>

          <button
            type="button"
            onClick={() => {
              setShowRecovery(true);
              setError(null);
            }}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            Esqueceu a senha?
          </button>
        </form>
      </div>
    </div>
  );
}
