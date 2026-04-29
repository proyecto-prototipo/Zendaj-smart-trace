import { useState } from 'react';
import { Activity, ShieldCheck, Zap, GaugeCircle, Car, Wrench, Disc } from 'lucide-react';
import { LoginForm } from '@/app/auth/LoginForm';
import { RoleQuickAccess } from '@/app/auth/RoleQuickAccess';
import { ForgotPasswordModal } from '@/app/auth/ForgotPasswordModal';

const LoginPage = () => {
  const [forgot, setForgot] = useState(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Hero side */}
      <div className="relative lg:w-[42%] bg-gradient-hero text-white p-8 lg:p-12 overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-primary-glow/30 blur-3xl animate-float" />
        <div className="absolute bottom-0 -left-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative z-10 flex flex-col w-full max-w-md">
          {/* Logo y Nombre - Centrado relativo al bloque */}
          <div className="flex items-center gap-5 mb-12">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 backdrop-blur shadow-glow border border-white/10 overflow-hidden p-2">
              <img 
                src="/logo.png" 
                alt="Zendaj Logo" 
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-display text-5xl font-extrabold tracking-tighter leading-none text-white">ZENDAJ</h1>
              <p className="text-sm uppercase tracking-[0.4em] text-white/80 mt-2 font-medium">Smart-Trace</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur px-3 py-1 text-xs font-medium w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Plataforma postventa de autopartes
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold leading-tight">
              Trazabilidad <span className="text-[#ffdf00] font-bold">inteligente</span> para incidencias y garantías.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              Centraliza reclamos, evidencias y validación técnica en un único flujo trazable, claro y confiable.
            </p>

            <div className="pt-4 space-y-6">
              {[
                { 
                  icon: ShieldCheck, 
                  title: 'Garantías validadas', 
                  desc: 'Decisión humana respaldada con evidencia',
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-500/10'
                },
                { 
                  icon: Zap, 
                  title: 'Casos en tiempo real', 
                  desc: 'Cada cambio queda registrado en el historial',
                  color: 'text-amber-400',
                  bg: 'bg-amber-500/10'
                },
                { 
                  icon: GaugeCircle, 
                  title: 'KPIs ejecutivos', 
                  desc: 'Tiempo de respuesta y fallas recurrentes',
                  color: 'text-cyan-400',
                  bg: 'bg-cyan-500/10'
                },
              ].map(({ icon: Icon, title, desc, color, bg }) => (
                <div key={title} className="flex items-start gap-4 group">

                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 ${bg} backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:border-white/20`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>

                  <div className="flex-1">
                    {/* Forzamos que el contenedor del título tenga una altura mínima que ayude a la alineación visual */}
                    <div className="h-12 flex flex-col justify-center"> 
                      <p className="font-bold text-base text-white/95 leading-none">{title}</p>
                    </div>
                    
                    {/* La descripción aparece justo debajo del bloque del título */}
                    <p className="text-sm text-white/60 leading-relaxed -mt-2">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-16 text-xs text-white/40">© {new Date().getFullYear()} ZENDAJ Smart-Trace · PMV de demostración</p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto relative bg-white">
        
        {/* ICONOS DECORATIVOS DE AUTOPARTES */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Cambiado text-slate-100 por text-slate-200 y subida la opacidad a 60/70 */}
        <Car className="absolute top-[10%] left-[10%] h-32 w-32 text-slate-200 animate-float opacity-70 rotate-12" />
        <Wrench className="absolute bottom-[15%] left-[5%] h-24 w-24 text-slate-200 animate-float-delayed opacity-60 -rotate-12" /> {/* Nota: animate-float-delayed requiere definir un delay en tailwind config o usar css arbitrario */}
        
        {/* Este gira lento (spin-slow), los otros flotan */}
        <Disc className="absolute top-[20%] right-[10%] h-40 w-40 text-slate-200 animate-spin-slow opacity-50" />
        
        <Disc className="absolute bottom-[10%] right-[20%] h-20 w-20 text-slate-200 animate-float opacity-60" />
        <Car className="absolute bottom-[40%] right-[5%] h-28 w-28 text-slate-200 animate-pulse-slow opacity-50 -rotate-90" /> {/* Cambiado animate-pulse por un pulso más lento si lo defines */}
    </div>

        <div className="w-full max-w-2xl space-y-8 animate-fade-in relative z-10">
          <div>
            <h3 className="font-display text-2xl lg:text-3xl font-bold">Bienvenido de vuelta</h3>
            <p className="mt-1 text-muted-foreground">Inicia sesión con tus credenciales corporativas.</p>
          </div>

          <div className="rounded-2xl border bg-white/70 backdrop-blur-lg p-6 lg:p-7 shadow-card">
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
