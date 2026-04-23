import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { useData } from '@/app/data/useData';
import { CaseStatus } from '@/app/types';
import { Button } from '@/app/ui/button';
import { Input } from '@/app/ui/input';
import { Textarea } from '@/app/ui/textarea';
import { Label } from '@/app/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/ui/select';
import { PageHeader } from '@/app/ui/page-header';
import { StatusBadge, PriorityBadge, WarrantyBadge } from '@/app/ui/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/ui/table';
import { Avatar, AvatarFallback } from '@/app/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/ui/dialog';
import { useAuth, roleLabels } from '@/app/auth/useAuth';
import { toast } from 'sonner';
import { formatDateTime, formatDate } from '@/app/format/format';

const statusFlow: CaseStatus[] = ['recibido','en_revision','observado','validado','resuelto','cerrado'];

const TrazabilidadPage = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { cases, evidences, history, updateCaseStatus, addCaseComment, closeCase } = useData();
  const session = useAuth(s => s.session)!;
  const [q, setQ] = useState('');
  const [comment, setComment] = useState('');
  const [statusChange, setStatusChange] = useState<CaseStatus | ''>('');
  const [closeOpen, setCloseOpen] = useState(false);
  const [finalResult, setFinalResult] = useState('');

  if (!id) {
    const filtered = cases.filter(c => !q || `${c.code} ${c.clientName} ${c.productName}`.toLowerCase().includes(q.toLowerCase()));
    return (
      <>
        <PageHeader kicker="Módulo 6" title="Seguimiento y trazabilidad" description="Cada caso conserva su historial completo. Nada se borra." />
        <div className="rounded-xl border bg-card shadow-card">
          <div className="p-4 border-b"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Buscar caso..." value={q} onChange={e => setQ(e.target.value)} /></div></div>
          <Table>
            <TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Cliente</TableHead><TableHead>Producto</TableHead><TableHead>Estado</TableHead><TableHead>Garantía</TableHead><TableHead>Fecha</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>{filtered.map(c => (
              <TableRow key={c.id} className="hover:bg-muted/40 cursor-pointer" onClick={() => nav(`/app/trazabilidad/${c.id}`)}>
                <TableCell><span className="font-mono text-xs font-semibold text-primary">{c.code}</span></TableCell>
                <TableCell className="text-sm">{c.clientName}</TableCell>
                <TableCell className="text-sm">{c.productName}</TableCell>
                <TableCell><StatusBadge status={c.status} /></TableCell>
                <TableCell><WarrantyBadge status={c.warrantyStatus} /></TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(c.date)}</TableCell>
                <TableCell><Button size="sm" variant="outline">Ver</Button></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div>
      </>
    );
  }

  const c = cases.find(x => x.id === id);
  if (!c) return <div className="p-8">Caso no encontrado. <Link to="/app/trazabilidad" className="text-primary">Volver</Link></div>;
  const evList = evidences.filter(e => e.caseId === c.id);
  const hist = history.filter(h => h.caseId === c.id).sort((a,b) => +new Date(b.date) - +new Date(a.date));
  const canManage = session.role !== 'cliente' && session.role !== 'gerencia';

  const onChangeStatus = () => {
    if (!statusChange) return;
    updateCaseStatus(c.id, statusChange, { name: session.name, role: session.role }, comment || undefined);
    toast.success(`Estado cambiado a ${statusChange}`);
    setStatusChange(''); setComment('');
  };

  const onComment = () => {
    if (!comment.trim()) return;
    addCaseComment(c.id, comment, { name: session.name, role: session.role });
    toast.success('Comentario añadido');
    setComment('');
  };

  const onClose = () => {
    if (!finalResult.trim()) { toast.error('No se puede cerrar un caso sin estado final'); return; }
    closeCase(c.id, finalResult, { name: session.name, role: session.role });
    toast.success('Caso cerrado correctamente');
    setCloseOpen(false); setFinalResult('');
  };

  const stepIdx = statusFlow.indexOf(c.status);

  return (
    <>
      <Link to="/app/trazabilidad" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-4 w-4 mr-1" />Volver</Link>
      <PageHeader kicker={c.code} title={c.productName} description={`Reclamo de ${c.clientName} · ${c.failureType}`}
        actions={<><StatusBadge status={c.status} /><PriorityBadge priority={c.priority} /><WarrantyBadge status={c.warrantyStatus} /></>} />

      {/* Stepper */}
      <div className="rounded-xl border bg-card shadow-card p-5 mb-6 overflow-x-auto">
        <div className="flex items-center min-w-[640px]">
          {statusFlow.map((s, i) => {
            const done = i <= stepIdx && c.status !== 'rechazado';
            const isRejected = c.status === 'rechazado' && s === 'cerrado';
            return (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center font-semibold text-xs ${done ? 'bg-gradient-primary text-white shadow-glow' : isRejected ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {done || isRejected ? <CheckCircle2 className="h-4 w-4" /> : i+1}
                  </div>
                  <p className={`mt-1 text-[11px] capitalize ${done ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{s.replace('_',' ')}</p>
                </div>
                {i < statusFlow.length - 1 && <div className={`h-0.5 flex-1 mx-1 ${i < stepIdx ? 'bg-gradient-primary' : 'bg-border'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-display font-semibold mb-3">Detalle</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-xs text-muted-foreground">Descripción</dt><dd>{c.description}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Observaciones</dt><dd>{c.observations || '—'}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Comprobante</dt><dd className="font-mono">{c.invoice}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Kilometraje</dt><dd className="font-mono">{c.mileage.toLocaleString()} km</dd></div>
              {c.technicalDecision && <div className="col-span-2"><dt className="text-xs text-muted-foreground">Decisión técnica</dt><dd className="p-2 rounded bg-muted/40">{c.technicalDecision}</dd></div>}
              {c.finalResult && <div className="col-span-2"><dt className="text-xs text-muted-foreground">Resultado final</dt><dd className="p-2 rounded bg-success/10 text-success-foreground border border-success/20">{c.finalResult}</dd></div>}
            </dl>
          </div>

          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-display font-semibold mb-3">Historial cronológico ({hist.length})</h3>
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
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Avatar className="h-5 w-5"><AvatarFallback className="text-[9px] bg-secondary">{h.user.split(' ').map(s=>s[0]).slice(0,2).join('')}</AvatarFallback></Avatar>
                    <span>{h.user} · {roleLabels[h.role]}</span>
                    <span>·</span><span>{formatDateTime(h.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-display font-semibold mb-3">Evidencias asociadas ({evList.length})</h3>
            {evList.length === 0 ? <p className="text-sm text-muted-foreground">Pendiente — no hay evidencias cargadas</p> : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {evList.map(e => (
                  <Link to="/app/evidencias" key={e.id} className="rounded-lg border p-3 hover:border-primary/40 transition">
                    <p className="text-sm font-medium truncate">{e.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{e.type} · {formatDate(e.uploadedAt)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {canManage && c.status !== 'cerrado' && (
            <>
              <div className="rounded-xl border bg-card shadow-card p-5 space-y-3">
                <h3 className="font-display font-semibold">Actualizar estado</h3>
                <Select value={statusChange} onValueChange={(v: CaseStatus) => setStatusChange(v)}>
                  <SelectTrigger><SelectValue placeholder="Nuevo estado" /></SelectTrigger>
                  <SelectContent>{statusFlow.filter(s => s !== c.status).map(s => <SelectItem key={s} value={s}>{s.replace('_',' ')}</SelectItem>)}</SelectContent>
                </Select>
                <Textarea rows={2} placeholder="Comentario (opcional)" value={comment} onChange={e => setComment(e.target.value)} />
                <Button onClick={onChangeStatus} disabled={!statusChange} className="w-full bg-gradient-primary text-primary-foreground">Aplicar cambio</Button>
              </div>
              <div className="rounded-xl border bg-card shadow-card p-5 space-y-3">
                <h3 className="font-display font-semibold">Comentar</h3>
                <Textarea rows={3} placeholder="Añade una nota al caso" value={comment} onChange={e => setComment(e.target.value)} />
                <Button onClick={onComment} variant="outline" className="w-full"><Send className="h-4 w-4 mr-2" />Enviar</Button>
              </div>
              <div className="rounded-xl border bg-destructive/5 border-destructive/30 p-5">
                <h3 className="font-display font-semibold text-destructive flex items-center gap-2"><AlertCircle className="h-4 w-4" />Cerrar caso</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-3">No se puede cerrar sin estado final. El historial no se podrá borrar.</p>
                <Button onClick={() => setCloseOpen(true)} variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/10">Cerrar caso</Button>
              </div>
            </>
          )}
          {c.status === 'cerrado' && <div className="rounded-xl border bg-muted p-5 text-center text-sm text-muted-foreground">Caso cerrado el {c.closedAt ? formatDate(c.closedAt) : '—'}</div>}
        </div>
      </div>

      <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cerrar caso {c.code}</DialogTitle><DialogDescription>Registra el resultado final. Esta acción es definitiva.</DialogDescription></DialogHeader>
          <Label>Resultado final *</Label>
          <Textarea rows={4} value={finalResult} onChange={e => setFinalResult(e.target.value)} placeholder="Describe el desenlace del caso..." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseOpen(false)}>Cancelar</Button>
            <Button onClick={onClose} className="bg-destructive text-destructive-foreground">Cerrar definitivamente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TrazabilidadPage;
