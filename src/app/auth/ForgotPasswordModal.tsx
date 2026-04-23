import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/ui/dialog';
import { Button } from '@/app/ui/button';
import { Input } from '@/app/ui/input';
import { Label } from '@/app/ui/label';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';

export const ForgotPasswordModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresa un correo válido');
      return;
    }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setSent(true);
  };

  const close = (v: boolean) => {
    onOpenChange(v);
    if (!v) setTimeout(() => { setSent(false); setEmail(''); setError(''); }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        {!sent ? (
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle className="font-display">Recuperar contraseña</DialogTitle>
              <DialogDescription>Te enviaremos un enlace para restablecer tu contraseña.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 my-5">
              <Label htmlFor="forgot-email">Correo registrado</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="forgot-email" type="email" placeholder="tu@empresa.com" value={email} onChange={e => setEmail(e.target.value)} className={`pl-9 h-11 ${error ? 'border-destructive' : ''}`} />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => close(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading} className="bg-gradient-primary text-primary-foreground">
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando...</> : 'Enviar enlace'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <DialogTitle className="font-display mb-2">Enlace enviado</DialogTitle>
            <DialogDescription>
              Hemos enviado instrucciones a <span className="font-semibold text-foreground">{email}</span>.
              Revisa tu bandeja de entrada.
            </DialogDescription>
            <Button onClick={() => close(false)} className="mt-6 bg-gradient-primary text-primary-foreground">Entendido</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
