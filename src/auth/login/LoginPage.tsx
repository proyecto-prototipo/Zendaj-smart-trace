import { useState } from 'react';
import { Activity, ShieldCheck, Zap, GaugeCircle } from 'lucide-react';
import { LoginForm } from '@/app/auth/LoginForm';
import { RoleQuickAccess } from '@/app/auth/RoleQuickAccess';
import { ForgotPasswordModal } from '@/app/auth/ForgotPasswordModal';

const LoginPage = () => {
  const [forgot, setForgot] = useState(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Hero side */}
      <div className="relative lg:w-[42%] bg-gradient-hero text-white p-8 lg:p-12 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-primary-glow/30 blur-3xl animate-float" />
        <div className="absolute bottom-0 -left-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight">ZENDAJ</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">Smart-Trace</p>
            </div>
          </div>

          <div className="mt-16 lg:mt-24 max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur px-3 py-1 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Plataforma postventa de autopartes
            </div>
            <h2 className="mt-5 font-display text-4xl lg:text-5xl font-bold leading-tight">
              Trazabilidad <span className="text-gradient bg-gradient-to-r from-primary-glow to-accent bg-clip-text text-transparent">inteligente</span> para incidencias y garantías.
            </h2>
            <p className="mt-4 text-white/70 text-lg">
              Centraliza reclamos, evidencias y validación técnica en un único flujo trazable, claro y confiable.
            </p>

            <div className="mt-10 space-y-4">
              {[
                { icon: ShieldCheck, title: 'Garantías validadas', desc: 'Decisión humana respaldada con evidencia' },
                { icon: Zap, title: 'Casos en tiempo real', desc: 'Cada cambio queda registrado en el historial' },
                { icon: GaugeCircle, title: 'KPIs ejecutivos', desc: 'Tiempo de respuesta y fallas recurrentes' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur border border-white/10">
                    <Icon className="h-4 w-4 text-primary-glow" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{title}</p>
                    <p className="text-xs text-white/60">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-auto pt-10 text-xs text-white/40">© {new Date().getFullYear()} ZENDAJ Smart-Trace · PMV de demostración</p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-2xl space-y-8 animate-fade-in">
          <div>
            <h3 className="font-display text-2xl lg:text-3xl font-bold">Bienvenido de vuelta</h3>
            <p className="mt-1 text-muted-foreground">Inicia sesión con tus credenciales corporativas.</p>
          </div>

          <div className="rounded-2xl border bg-card p-6 lg:p-7 shadow-card">
            <LoginForm onForgot={() => setForgot(true)} />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Acceso rápido por rol · modo demo</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <RoleQuickAccess />
            <p className="mt-3 text-xs text-muted-foreground text-center">
              Credenciales demo: <span className="font-mono text-foreground">admin@zendaj.com</span> · <span className="font-mono text-foreground">123456</span>
            </p>
          </div>
        </div>
      </div>

      <ForgotPasswordModal open={forgot} onOpenChange={setForgot} />
    </div>
  );
};

export default LoginPage;
