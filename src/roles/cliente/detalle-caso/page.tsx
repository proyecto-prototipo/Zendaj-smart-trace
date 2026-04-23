import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth, roleLabels } from '@/app/auth/useAuth';
import { useData } from '@/app/data/useData';
import { PageHeader } from '@/app/ui/page-header';
import { Button } from '@/app/ui/button';
import { StatusBadge, PriorityBadge, WarrantyBadge } from '@/app/ui/status-badge';
import { Avatar, AvatarFallback } from '@/app/ui/avatar';
import { ArrowLeft, FileImage, FileText, CheckCircle2 } from 'lucide-react';
import { formatDate, formatDateTime } from '@/app/format/format';
import { CaseStatus } from '@/app/types';

const flow: CaseStatus[] = ['recibido','en_revision','observado','validado','resuelto','cerrado'];

const ClientCaseDetail = () => {
  const { id } = useParams();
  const session = useAuth(s => s.session)!;
  const { cases, users, history, evidences } = useData();
  const me = useMemo(() => users.find(u => u.email === session.email), [users, session.email]);
  const c = cases.find(x => x.id === id && x.clientId === me?.id);

  if (!c) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-muted-foreground mb-3">Caso no encontrado o no te pertenece.</p>
        <Button asChild variant="outline"><Link to="/app/cliente/reclamos">Volver a mis reclamos</Link></Button>
      </div>
    );
  }

  const evList = evidences.filter(e => e.caseId === c.id);
  const hist = history.filter(h => h.caseId === c.id).sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const stepIdx = flow.indexOf(c.status);
  const observations = hist.filter(h => h.comment && h.role !== 'cliente');

  return (
    <>
      <Link to="/app/cliente/reclamos" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" />Volver a mis reclamos
      </Link>
      <PageHeader
        kicker={c.code}
        title={c.productName}
        description={`${c.failureType} · Reportado el ${formatDate(c.date)}`}
        actions={<><StatusBadge status={c.status} /><PriorityBadge priority={c.priority} /><WarrantyBadge status={c.warrantyStatus} /></>}
      />

      {/* Stepper estado */}
      <div className="rounded-xl border bg-card shadow-card p-5 mb-6 overflow-x-auto">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Estado del caso</p>
        <div className="flex items-center min-w-[640px]">
          {flow.map((s, i) => {
            const done = i <= stepIdx && c.status !== 'rechazado';
            const isRejected = c.status === 'rechazado' && s === 'cerrado';
            return (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center font-semibold text-xs ${done ? 'bg-gradient-primary text-white shadow-glow' : isRejected ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {done || isRejected ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <p className={`mt-1 text-[11px] capitalize ${done ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{s.replace('_', ' ')}</p>
                </div>
                {i < flow.length - 1 && <div className={`h-0.5 flex-1 mx-1 ${i < stepIdx ? 'bg-gradient-primary' : 'bg-border'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-display font-semibold mb-3">Detalle del reclamo</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-xs text-muted-foreground">Descripción</dt><dd>{c.description}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Observaciones</dt><dd>{c.observations || '—'}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Comprobante</dt><dd className="font-mono">{c.invoice}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Kilometraje</dt><dd className="font-mono">{c.mileage.toLocaleString()} km</dd></div>
            </dl>
          </div>

          {/* Resultado final */}
          {c.finalResult ? (
            <div className="rounded-xl border-2 border-success/30 bg-success/5 p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <h3 className="font-display font-semibold text-success">Resultado final</h3>
              </div>
              <p className="text-sm">{c.finalResult}</p>
              {c.closedAt && <p className="text-xs text-muted-foreground mt-2">Cerrado el {formatDate(c.closedAt)}</p>}
            </div>
          ) : (
            <div className="rounded-xl border bg-muted/30 p-5">
              <p className="text-sm text-muted-foreground"><span className="font-medium">Resultado final:</span> Pendiente. Tu caso aún se encuentra en proceso.</p>
            </div>
          )}

          {/* Observaciones del equipo */}
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-display font-semibold mb-3">Observaciones del equipo ({observations.length})</h3>
            {observations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay observaciones registradas por el asesor o técnico.</p>
            ) : (
              <div className="space-y-3">
                {observations.map(h => (
                  <div key={h.id} className="rounded-lg border-l-2 border-primary bg-muted/30 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px] bg-secondary">{h.user.split(' ').map(s=>s[0]).slice(0,2).join('')}</AvatarFallback></Avatar>
                      <span className="text-xs font-medium">{h.user}</span>
                      <span className="text-xs text-muted-foreground">· {roleLabels[h.role]}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{formatDateTime(h.date)}</span>
                    </div>
                    <p className="text-sm">{h.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-display font-semibold mb-3">Seguimiento del caso ({hist.length})</h3>
            <div className="relative pl-6 space-y-5">
              <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
              {hist.map(h => (
                <div key={h.id} className="relative">
                  <div className="absolute -left-[18px] top-1 h-3 w-3 rounded-full bg-gradient-primary ring-4 ring-background" />
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-sm font-semibold">{h.action}</p>
                    {h.toStatus && <StatusBadge status={h.toStatus} />}
                  </div>
                  {h.comment && <p className="text-sm text-muted-foreground">{h.comment}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{h.user} · {roleLabels[h.role]} · {formatDateTime(h.date)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-display font-semibold mb-3">Evidencias ({evList.length})</h3>
            {evList.length === 0 ? (
              <p className="text-sm text-muted-foreground">Pendiente — no hay evidencias cargadas.</p>
            ) : (
              <div className="space-y-2">
                {evList.map(e => {
                  const Icon = e.type === 'foto' ? FileImage : FileText;
                  return (
                    <div key={e.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {e.url ? <img src={e.url} alt="" className="h-full w-full object-cover" /> : <Icon className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{e.name}</p>
                        <p className="text-[11px] text-muted-foreground capitalize">{e.type} · {formatDate(e.uploadedAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-accent/5 p-5 text-sm">
            <p className="font-medium mb-1">¿Necesitas ayuda?</p>
            <p className="text-xs text-muted-foreground">Tu asesor postventa está revisando tu caso. Te notificaremos cada actualización.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientCaseDetail;
