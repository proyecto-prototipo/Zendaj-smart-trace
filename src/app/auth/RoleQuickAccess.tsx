import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Headset, Wrench, User as UserIcon, BarChart3, ArrowRight } from 'lucide-react';
import { Role } from '@/app/types';
import { useAuth, rolePaths } from '@/app/auth/useAuth';
import { toast } from 'sonner';

const roles: { role: Role; icon: any; title: string; desc: string; gradient: string }[] = [
  { role: 'administrador', icon: ShieldCheck, title: 'Administrador', desc: 'Control total del sistema y configuración', gradient: 'from-primary to-primary-glow' },
  { role: 'asesor', icon: Headset, title: 'Asesor Postventa', desc: 'Atiende clientes y registra incidencias', gradient: 'from-accent to-cyan-400' },
  { role: 'tecnico', icon: Wrench, title: 'Técnico Evaluador', desc: 'Valida garantías y emite decisiones', gradient: 'from-amber-500 to-orange-500' },
  { role: 'cliente', icon: UserIcon, title: 'Cliente', desc: 'Consulta el estado de tu reclamo', gradient: 'from-violet-500 to-fuchsia-500' },
  { role: 'gerencia', icon: BarChart3, title: 'Gerencia', desc: 'Indicadores y reportes ejecutivos', gradient: 'from-emerald-500 to-teal-500' },
];

export const RoleQuickAccess = () => {
  const loginAs = useAuth(s => s.loginAs);
  const nav = useNavigate();

  const enter = (role: Role) => {
    loginAs(role);
    toast.success(`Ingresando como ${roles.find(r => r.role === role)?.title}`);
    nav(rolePaths[role], { replace: true });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {roles.map(({ role, icon: Icon, title, desc, gradient }) => (
        <button key={role} onClick={() => enter(role)}
          className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-elegant hover:-translate-y-0.5">
          <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white shadow-lg`}>
            <Icon className="h-5 w-5" />
          </div>
          <h4 className="mt-3 font-semibold text-sm font-display">{title}</h4>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{desc}</p>
          <div className="mt-3 flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Ingresar <ArrowRight className="ml-1 h-3 w-3" />
          </div>
        </button>
      ))}
    </div>
  );
};
