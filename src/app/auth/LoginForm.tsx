import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/app/ui/button';
import { Input } from '@/app/ui/input';
import { Label } from '@/app/ui/label';
import { Checkbox } from '@/app/ui/checkbox';
import { useAuth, rolePaths } from '@/app/auth/useAuth';
import { toast } from 'sonner';

interface Props { onForgot: () => void; }

export const LoginForm = ({ onForgot }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const login = useAuth(s => s.login);
  const nav = useNavigate();

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'El usuario o correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Formato de correo inválido';
    if (!password) e.password = 'La contraseña es obligatoria';
    else if (password.length < 4) e.password = 'Mínimo 4 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const res = login(email, password);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.message || 'No se pudo iniciar sesión');
      return;
    }
    toast.success('Bienvenido a ZENDAJ SMART-TRACE');
    nav(rolePaths[res.role!], { replace: true });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Usuario o correo</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="email" type="email" autoComplete="email" placeholder="tu@empresa.com"
            value={email} onChange={e => setEmail(e.target.value)}
            className={`pl-9 h-11 ${errors.email ? 'border-destructive' : ''}`} />
        </div>
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)}
            className={`pl-9 pr-10 h-11 ${errors.password ? 'border-destructive' : ''}`} />
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={remember} onCheckedChange={v => setRemember(!!v)} />
          <span className="text-muted-foreground">Recordarme</span>
        </label>
        <button type="button" onClick={onForgot} className="text-primary hover:underline font-medium">
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-primary hover:opacity-95 text-primary-foreground font-semibold shadow-elegant">
        {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verificando...</> : 'Iniciar sesión'}
      </Button>
    </form>
  );
};
