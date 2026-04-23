import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, ShieldAlert, ShieldQuestion, MessageSquare, Search } from 'lucide-react';
import { useData } from '@/app/data/useData';
import { Case, WarrantyStatus } from '@/app/types';
import { Button } from '@/app/ui/button';
import { Input } from '@/app/ui/input';
import { Textarea } from '@/app/ui/textarea';
import { Label } from '@/app/ui/label';
import { Checkbox } from '@/app/ui/checkbox';
import { PageHeader } from '@/app/ui/page-header';
import { StatusBadge, PriorityBadge, WarrantyBadge } from '@/app/ui/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/ui/table';
import { useAuth } from '@/app/auth/useAuth';
import { toast } from 'sonner';
import { formatDate } from '@/app/format/format';

const defaultChecklist = [
  { label: 'Comprobante de compra válido', checked: false },
  { label: 'Producto dentro del período de garantía', checked: false },
  { label: 'Falla atribuible al producto', checked: false },
  { label: 'Sin signos de mal uso o instalación incorrecta', checked: false },
  { label: 'Evidencia técnica suficiente', checked: false },
];

const WarrantyPage = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { cases, evidences, sales, updateWarranty } = useData();
  const session = useAuth(s => s.session)!;
  const [q, setQ] = useState('');

  if (!id) {
    const list = cases.filter(c => ['pendiente','en_revision','observado'].includes(c.warrantyStatus));
    const filtered = list.filter(c => !q || `${c.code} ${c.clientName} ${c.productName}`.toLowerCase().includes(q.toLowerCase()));
    return (
      <>
        <PageHeader kicker="Módulo 5" title="Validación de garantía" description="Casos pendientes de evaluación técnica." />
        <div className="rounded-xl border bg-card shadow-card">
          <div className="p-4 border-b"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Buscar..." value={q} onChange={e => setQ(e.target.value)} /></div></div>
          <Table>
            <TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Cliente</TableHead><TableHead>Producto</TableHead><TableHead>Falla</TableHead><TableHead>Prioridad</TableHead><TableHead>Garantía</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Sin casos pendientes</TableCell></TableRow>}
              {filtered.map(c => (
                <TableRow key={c.id} className="hover:bg-muted/40">
                  <TableCell><span className="font-mono text-xs font-semibold text-primary">{c.code}</span></TableCell>
                  <TableCell className="text-sm">{c.clientName}</TableCell>
                  <TableCell className="text-sm">{c.productName}</TableCell>
                  <TableCell className="text-sm">{c.failureType}</TableCell>
                  <TableCell><PriorityBadge priority={c.priority} /></TableCell>
                  <TableCell><WarrantyBadge status={c.warrantyStatus} /></TableCell>
                  <TableCell><Button size="sm" onClick={() => nav(`/app/garantias/${c.id}`)}>Evaluar</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </>
    );
  }

  const c = cases.find(x => x.id === id);
  if (!c) return <div className="p-8">Caso no encontrado <Link to="/app/garantias" className="text-primary">Volver</Link></div>;
  return <WarrantyDetail caseData={c} evidencesCount={evidences.filter(e => e.caseId === c.id).length} sale={sales.find(s => s.id === c.saleId)} onSave={(ws, dec, ck) => { updateWarranty(c.id, ws, dec, ck, { name: session.name, role: session.role }); toast.success('Decisión registrada'); nav('/app/garantias'); }} />;
};

const WarrantyDetail = ({ caseData, evidencesCount, sale, onSave }: { caseData: Case; evidencesCount: number; sale?: any; onSave: (ws: WarrantyStatus, decision: string, checklist: any[]) => void }) => {
  const [decision, setDecision] = useState(caseData.technicalDecision || '');
  const [checklist, setChecklist] = useState(caseData.warrantyChecklist || defaultChecklist);

  const action = (ws: WarrantyStatus) => {
    if (!decision.trim()) { toast.error('Debes registrar tu observación técnica'); return; }
    onSave(ws, decision, checklist);
  };

  return (
    <>
      <Link to="/app/garantias" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-4 w-4 mr-1" />Volver</Link>
      <PageHeader kicker={`Validación · ${caseData.code}`} title="Panel de evaluación técnica" description="Tu decisión queda registrada en el historial. La aprobación no es automática." />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-display font-semibold mb-3">Ficha del caso</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-xs text-muted-foreground">Cliente</dt><dd className="font-medium">{caseData.clientName}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Producto</dt><dd className="font-medium">{caseData.productName}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Falla reportada</dt><dd className="font-medium">{caseData.failureType}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Comprobante</dt><dd className="font-mono">{caseData.invoice}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Fecha compra</dt><dd>{sale ? formatDate(sale.purchaseDate) : '—'}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Fecha reclamo</dt><dd>{formatDate(caseData.date)}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Kilometraje</dt><dd className="font-mono">{caseData.mileage.toLocaleString()} km</dd></div>
              <div><dt className="text-xs text-muted-foreground">Evidencias</dt><dd className="font-medium">{evidencesCount} archivos</dd></div>
              <div className="col-span-2"><dt className="text-xs text-muted-foreground">Descripción</dt><dd className="text-sm">{caseData.description}</dd></div>
            </dl>
          </div>
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-display font-semibold mb-3">Checklist de evaluación</h3>
            <div className="space-y-2">
              {checklist.map((item, i) => (
                <label key={i} className="flex items-center gap-3 p-2 rounded hover:bg-muted/40 cursor-pointer">
                  <Checkbox checked={item.checked} onCheckedChange={(v) => setChecklist(cl => cl.map((x, j) => j === i ? { ...x, checked: !!v } : x))} />
                  <span className="text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-xl border bg-card shadow-card p-5">
            <Label className="font-display font-semibold">Observaciones técnicas y decisión preliminar</Label>
            <Textarea rows={5} className="mt-2" value={decision} onChange={e => setDecision(e.target.value)} placeholder="Describe la evaluación realizada, hallazgos y la decisión preliminar..." />
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border bg-card shadow-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Estado actual</p>
            <div className="mt-2 flex flex-col gap-2"><StatusBadge status={caseData.status} /><WarrantyBadge status={caseData.warrantyStatus} /></div>
          </div>
          <div className="rounded-xl border bg-card shadow-card p-5 space-y-2">
            <p className="text-sm font-semibold">Acciones del técnico</p>
            <Button onClick={() => action('validado')} className="w-full bg-success hover:bg-success/90 text-success-foreground"><ShieldCheck className="h-4 w-4 mr-2" />Validar para seguimiento</Button>
            <Button onClick={() => action('observado')} variant="outline" className="w-full border-amber-500 text-amber-600 hover:bg-amber-50"><ShieldQuestion className="h-4 w-4 mr-2" />Observar</Button>
            <Button onClick={() => action('rechazado')} variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/10"><ShieldAlert className="h-4 w-4 mr-2" />Rechazar preliminarmente</Button>
            <p className="text-[11px] text-muted-foreground pt-2 border-t">Toda decisión queda registrada con tu nombre, fecha y observaciones.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default WarrantyPage;
