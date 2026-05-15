import { useState, useMemo, useEffect } from 'react';
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
    const filtered = cases.filter(c => !q || `${c.code} ${c.client_name} ${c.product_name}`.toLowerCase().includes(q.toLowerCase()));
    return (
      <>
        <PageHeader kicker="Módulo 6" title="Seguimiento y trazabilidad" description="Cada caso conserva su historial completo." />
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <div className="p-4 border-b">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 w-full" placeholder="Buscar caso..." value={q} onChange={e => setQ(e.target.value)} />
            </div>
          </div>
          {/* TABLA RESPONSIVA */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Producto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden sm:table-cell">Garantía</TableHead>
                  <TableHead className="hidden lg:table-cell">Fecha</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(c => (
                  <TableRow key={c.id} className="hover:bg-muted/40 cursor-pointer" onClick={() => nav(`/app/trazabilidad/${c.id}`)}>
                    <TableCell><span className="font-mono text-xs font-semibold text-primary">{c.code}</span></TableCell>
                    <TableCell className="text-sm">
                      <p className="font-medium">{c.client_name}</p>
                      <p className="text-[10px] md:hidden text-muted-foreground truncate max-w-[100px]">{c.product_name}</p>
                    </TableCell>
                    <TableCell className="text-sm hidden md:table-cell">{c.product_name}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell className="hidden sm:table-cell"><WarrantyBadge status={c.warranty_status || c.warrantyStatus} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">{formatDate(c.date)}</TableCell>
                    <TableCell className="text-right"><Button size="sm" variant="outline">Ver</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </>
    );
  }

  const c = cases.find(x => x.id === id);
  if (!c) return <div className="p-8">Caso no encontrado. <Link to="/app/trazabilidad" className="text-primary">Volver</Link></div>;
  const evList = evidences.filter(e => e.case_id === c.id);
  const hist = history.filter(h => h.case_id === c.id)
                    .sort((a,b) => +new Date(b.date || b.created_at) - +new Date(a.date || a.created_at));
  const canManage = session.role !== 'cliente' && session.role !== 'gerencia';

  const onChangeStatus = async () => {
    if (!statusChange) return;   

    await updateCaseStatus(c.id, statusChange);

    if (comment.trim()) {
    await addCaseComment(c.id, comment, { name: session.name, role: session.role });
    }

    toast.success(`Estado actualizado`);
    setStatusChange(''); 
    setComment('');
  };

  const onComment = () => {
    if (!comment.trim()) return;
    addCaseComment(c.id, comment, { name: session.name, role: session.role });
    toast.success('Comentario añadido');
    setComment('');
  };

  const onClose = () => {
    if (!finalResult.trim()) { toast.error('Se requiere resultado final'); return; }
    closeCase(c.id, finalResult, { name: session.name, role: session.role });
    toast.success('Caso cerrado');
    setCloseOpen(false); setFinalResult('');
  };

  const stepIdx = statusFlow.indexOf(c.status);

  return (
    <>
      <Link to="/app/trazabilidad" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" />Volver
      </Link>
      
      <PageHeader kicker={c.code} title={c.product_name} description={`Reclamo de ${c.client_name}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={c.status} />
            <div className="hidden sm:flex gap-2">
               <PriorityBadge priority={c.priority} />
               <WarrantyBadge status={c.warrantyStatus} />
            </div>
          </div>
        } 
      />

      {/* Stepper Responsivo */}
      <div className="rounded-xl border bg-card shadow-card p-5 mb-6 overflow-x-auto scrollbar-hide">
        <div className="flex items-center min-w-[700px] justify-between px-2">
          {statusFlow.map((s, i) => {
            const done = i <= stepIdx && c.status !== 'rechazado';
            const isRejected = c.status === 'rechazado' && s === 'cerrado';
            return (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center shrink-0">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold text-[10px] transition-all ${done ? 'bg-gradient-primary text-white shadow-glow scale-110' : isRejected ? 'bg-destructive text-white' : 'bg-muted text-muted-foreground'}`}>
                    {done || isRejected ? <CheckCircle2 className="h-4 w-4" /> : i+1}
                  </div>
                  <p className={`mt-2 text-[10px] uppercase tracking-tighter font-bold ${done ? 'text-foreground' : 'text-muted-foreground'}`}>{s.replace('_',' ')}</p>
                </div>
                {i < statusFlow.length - 1 && <div className={`h-0.5 w-full mx-2 ${i < stepIdx ? 'bg-gradient-primary' : 'bg-border'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card shadow-card p-4 sm:p-5">
            <h3 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Detalle del caso</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="sm:col-span-2"><dt className="text-[10px] uppercase font-bold text-muted-foreground/60 mb-1">Descripción del problema</dt><dd className="bg-muted/30 p-3 rounded-lg">{c.description}</dd></div>
              <div><dt className="text-[10px] uppercase font-bold text-muted-foreground/60 mb-1">Comprobante</dt><dd className="font-mono bg-muted/30 p-2 rounded-lg">{c.invoice}</dd></div>
              <div><dt className="text-[10px] uppercase font-bold text-muted-foreground/60 mb-1">Kilometraje</dt><dd className="font-mono bg-muted/30 p-2 rounded-lg">{c.mileage.toLocaleString()} km</dd></div>
              {c.technicalDecision && <div className="sm:col-span-2"><dt className="text-[10px] uppercase font-bold text-muted-foreground/60 mb-1">Decisión técnica</dt><dd className="p-3 rounded-lg bg-primary/5 border border-primary/10">{c.technicalDecision}</dd></div>}
              {c.finalResult && <div className="sm:col-span-2"><dt className="text-[10px] uppercase font-bold text-muted-foreground/60 mb-1">Resultado final</dt><dd className="p-3 rounded-lg bg-success/5 text-success-foreground border border-success/20">{c.finalResult}</dd></div>}
            </dl>
          </div>

          <div className="rounded-xl border bg-card shadow-card p-4 sm:p-5">
            <h3 className="font-display font-semibold mb-6 text-sm uppercase tracking-wider text-muted-foreground">Línea de tiempo ({hist.length})</h3>
            <div className="relative pl-4 sm:pl-6 space-y-6">
              <div className="absolute left-[7px] sm:left-2 top-2 bottom-2 w-px bg-border" />
              {hist.map(h => (
                <div key={h.id} className="relative">
                  <div className="absolute -left-[23px] sm:-left-[18px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                    <p className="text-sm font-bold">{h.action}</p>
                    {/* Renderizado dinámico del Badge usando la nomenclatura de Supabase */}
                    {h.to_status && (
                      <StatusBadge status={h.to_status as CaseStatus} />
                    )}
                  </div>
                  {h.comment && <p className="text-xs sm:text-sm text-muted-foreground bg-muted/20 p-2 rounded-md italic">"{h.comment}"</p>}
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                    <Avatar className="h-4 w-4"><AvatarFallback className="text-[7px]">{((h.user || (h as any).user_name || 'U') as string)[0]}</AvatarFallback></Avatar>
                    <span>{h.user || (h as any).user_name} · {formatDateTime(h.date || (h as any).created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-card p-4 sm:p-5">
            <h3 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Evidencias ({evList.length})</h3>
            {evList.length === 0 ? <p className="text-xs text-muted-foreground text-center py-4 bg-muted/10 rounded-lg border border-dashed">No hay evidencias cargadas</p> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {evList.map(e => (
                  <Link to="/app/evidencias" key={e.id} className="rounded-lg border p-3 hover:bg-muted/30 transition-all flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center shrink-0">
                       <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{e.name}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{e.type}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {canManage && c.status !== 'cerrado' && (
            <div className="sticky top-20 space-y-4">
              <div className="rounded-xl border bg-card shadow-card p-5 space-y-4">
                <h3 className="font-display font-semibold text-sm">Gestión de estado</h3>
                <div className="space-y-2">
                   <Label className="text-[10px] uppercase font-bold">Nuevo estado</Label>
                   <Select value={statusChange} onValueChange={(v: CaseStatus) => setStatusChange(v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>{statusFlow.filter(s => s !== c.status).map(s => <SelectItem key={s} value={s}>{s.replace('_',' ')}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] uppercase font-bold">Comentario técnico</Label>
                   <Textarea rows={3} placeholder="Notas sobre el cambio..." value={comment} onChange={e => setComment(e.target.value)} className="text-xs" />
                </div>
                <Button onClick={onChangeStatus} disabled={!statusChange} className="w-full bg-gradient-primary text-white shadow-md">Actualizar seguimiento</Button>
              </div>

              <div className="rounded-xl border bg-destructive/5 border-destructive/20 p-5 text-center">
                <h3 className="font-display font-semibold text-destructive text-sm flex items-center justify-center gap-2 mb-2"><AlertCircle className="h-4 w-4" />Cerrar incidencia</h3>
                <p className="text-[10px] text-muted-foreground mb-4 px-2">Solo debe cerrarse cuando el cliente haya recibido una respuesta final definitiva.</p>
                <Button onClick={() => setCloseOpen(true)} variant="outline" className="w-full border-destructive/50 text-destructive hover:bg-destructive text-xs">Cerrar caso definitivamente</Button>
              </div>
            </div>
          )}
          {c.status === 'cerrado' && <div className="rounded-xl border bg-success/5 border-success/20 p-6 text-center text-xs font-medium text-success-foreground">Esta incidencia fue cerrada exitosamente el {c.closedAt ? formatDate(c.closedAt) : '—'}</div>}
        </div>
      </div>

      <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base">Cierre de caso {c.code}</DialogTitle>
            <DialogDescription className="text-xs">Detalla la resolución final que se le comunicará al cliente.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label className="text-xs mb-2 block">Resultado final y conclusiones *</Label>
            <Textarea rows={5} value={finalResult} onChange={e => setFinalResult(e.target.value)} placeholder="Ej: Se procedió con el cambio físico de la pieza por defecto de fábrica..." className="text-xs" />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setCloseOpen(false)} className="w-full sm:w-auto">Cancelar</Button>
            <Button onClick={onClose} className="bg-destructive text-white w-full sm:w-auto">Cerrar definitivamente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TrazabilidadPage;