import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/auth/useAuth';
import { useData } from '@/app/data/useData';
import { PageHeader } from '@/app/ui/page-header';
import { Button } from '@/app/ui/button';
import { StatusBadge } from '@/app/ui/status-badge';
import { FilePlus2, ClipboardList, MessageSquare, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatDate } from '@/app/format/format';

const ClientHome = () => {
  const session = useAuth(s => s.session)!;
  const { cases, users, history } = useData();
  const me = useMemo(() => users.find(u => u.email === session.email), [users, session.email]);
  const myCases = useMemo(() => cases.filter(c => c.clientId === me?.id), [cases, me]);

  const open = myCases.filter(c => !['cerrado','resuelto','rechazado'].includes(c.status)).length;
  const resolved = myCases.filter(c => ['cerrado','resuelto'].includes(c.status)).length;
  const validated = myCases.filter(c => c.warrantyStatus === 'validado').length;

  const lastEvents = useMemo(() => {
    const myIds = new Set(myCases.map(c => c.id));
    return history.filter(h => myIds.has(h.caseId))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 5);
  }, [history, myCases]);

  return (
    <>
      <PageHeader
        kicker={`Hola, ${session.name.split(' ')[0]}`}
        title="Mi panel"
        description="Inicia un nuevo reclamo o consulta el avance de tus casos en un solo lugar."
        actions={
          <Button asChild className="bg-gradient-primary text-primary-foreground">
            <Link to="/app/cliente/nuevo"><FilePlus2 className="h-4 w-4 mr-2" />Registrar incidencia</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: ClipboardList, label: 'Mis reclamos', value: myCases.length, gradient: 'bg-gradient-to-br from-primary to-primary-glow' },
          { icon: MessageSquare, label: 'En proceso', value: open, gradient: 'bg-gradient-to-br from-amber-500 to-orange-500' },
          { icon: ShieldCheck, label: 'Garantías validadas', value: validated, gradient: 'bg-gradient-to-br from-accent to-cyan-400' },
          { icon: CheckCircle2, label: 'Resueltos', value: resolved, gradient: 'bg-gradient-to-br from-emerald-500 to-teal-500' },
        ].map(k => (
          <div key={k.label} className="rounded-xl border bg-card shadow-card p-5 relative overflow-hidden">
            <div className={`absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-20 ${k.gradient}`} />
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${k.gradient} text-white relative`}><k.icon className="h-5 w-5" /></div>
            <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">{k.label}</p>
            <p className="font-display text-3xl font-bold mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="rounded-xl border bg-card shadow-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold">Reclamos recientes</h3>
            <Button asChild size="sm" variant="outline"><Link to="/app/cliente/reclamos">Ver todos</Link></Button>
          </div>
          {myCases.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Aún no has registrado reclamos. <Link to="/app/cliente/nuevo" className="text-primary font-medium">Registra el primero</Link>.
            </div>
          ) : (
            <div className="space-y-2">
              {myCases.slice(0, 5).map(c => (
                <Link to={`/app/cliente/caso/${c.id}`} key={c.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/40 border border-transparent hover:border-border transition group">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-primary">{c.code}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-sm font-medium mt-1 truncate">{c.productName}</p>
                    <p className="text-xs text-muted-foreground">{c.failureType} · {formatDate(c.date)}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card shadow-card p-5">
          <h3 className="font-display font-semibold mb-3">Últimas actualizaciones</h3>
          {lastEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin actividad reciente.</p>
          ) : (
            <div className="relative pl-5 space-y-4">
              <div className="absolute left-1.5 top-1 bottom-1 w-px bg-border" />
              {lastEvents.map(h => {
                const c = myCases.find(x => x.id === h.caseId);
                return (
                  <div key={h.id} className="relative">
                    <div className="absolute -left-[14px] top-1 h-2.5 w-2.5 rounded-full bg-gradient-primary ring-4 ring-background" />
                    <p className="text-xs font-mono text-primary">{c?.code}</p>
                    <p className="text-sm font-medium">{h.action}</p>
                    {h.comment && <p className="text-xs text-muted-foreground line-clamp-2">{h.comment}</p>}
                    <p className="text-[11px] text-muted-foreground mt-0.5">{formatDate(h.date)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ClientHome;
