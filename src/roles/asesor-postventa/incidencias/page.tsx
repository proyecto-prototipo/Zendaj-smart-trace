import { useMemo, useState } from 'react';
import { Plus, Search, Eye, AlertTriangle } from 'lucide-react';
import { useData } from '@/app/data/useData';
import { Case, Priority } from '@/app/types';
import { Button } from '@/app/ui/button';
import { Input } from '@/app/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/ui/dialog';
import { Label } from '@/app/ui/label';
import { Textarea } from '@/app/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/ui/table';
import { PageHeader } from '@/app/ui/page-header';
import { PriorityBadge, StatusBadge } from '@/app/ui/status-badge';
import { useAuth } from '@/app/auth/useAuth';
import { toast } from 'sonner';
import { formatDate } from '@/app/format/format';
import { useNavigate } from 'react-router-dom';

const IncidentsPage = () => {
  const { cases, sales, users, failureTypes, addCase } = useData();
  const session = useAuth(s => s.session)!;
  const nav = useNavigate();
  const clients = users.filter(u => u.type === 'cliente');

  const [q, setQ] = useState('');
  const [statusF, setStatusF] = useState('all');
  const [priorityF, setPriorityF] = useState('all');
  const [open, setOpen] = useState(false);
  const [createdCase, setCreatedCase] = useState<Case | null>(null);

  const [form, setForm] = useState({
    clientId: '', saleId: '', failureType: '', description: '', observations: '',
    invoice: '', mileage: 0, priority: 'media' as Priority,
  });
  const [errors, setErrors] = useState<Record<string,string>>({});

  // Cliente solo ve sus casos
  const visible = useMemo(() => {
    let list = cases;
    if (session.role === 'cliente') {
      const me = users.find(u => u.email === session.email);
      list = list.filter(c => c.clientId === me?.id);
    }
    return list.filter(c => {
      const m = q.toLowerCase().trim();
      if (m && !`${c.code} ${c.clientName} ${c.productName} ${c.failureType}`.toLowerCase().includes(m)) return false;
      if (statusF !== 'all' && c.status !== statusF) return false;
      if (priorityF !== 'all' && c.priority !== priorityF) return false;
      return true;
    });
  }, [cases, q, statusF, priorityF, session, users]);

  const clientSales = useMemo(() => sales.filter(s => s.clientId === form.clientId), [sales, form.clientId]);

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.clientId) e.clientId = 'Selecciona cliente';
    if (!form.saleId) e.saleId = 'Selecciona producto vendido';
    if (!form.failureType) e.failureType = 'Tipo de falla obligatorio';
    if (!form.description.trim() || form.description.length < 15) e.description = 'Describe el problema (mín. 15 caracteres)';
    if (form.mileage < 0) e.mileage = 'Kilometraje inválido';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    const client = clients.find(c => c.id === form.clientId)!;
    const sale = sales.find(s => s.id === form.saleId)!;
    const c = addCase({
      date: new Date().toISOString().slice(0,10),
      clientId: form.clientId, clientName: client.name,
      saleId: form.saleId, productName: sale.productName,
      failureType: form.failureType, description: form.description,
      observations: form.observations, invoice: sale.invoice,
      mileage: form.mileage, priority: form.priority,
      createdBy: session.name,
    } as any, { name: session.name, role: session.role });
    setOpen(false);
    setCreatedCase(c);
    setForm({ clientId:'', saleId:'', failureType:'', description:'', observations:'', invoice:'', mileage:0, priority:'media' });
  };

  const openCase = (id: string) => nav(`/app/trazabilidad/${id}`);

  return (
    <>
      <PageHeader kicker="Módulo 3" title="Incidencias y reclamos"
        description="Registra nuevos casos y consulta el estado de los existentes. Cada caso recibe un código único."
        actions={session.role !== 'cliente' && session.role !== 'gerencia' && session.role !== 'tecnico' ? (
          <Button onClick={() => setOpen(true)} className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Nuevo caso</Button>
        ) : null}
      />

      <div className="rounded-xl border bg-card shadow-card">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por código, cliente, producto..." value={q} onChange={e => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusF} onValueChange={setStatusF}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {['recibido','en_revision','observado','validado','resuelto','cerrado','rechazado'].map(s => <SelectItem key={s} value={s}>{s.replace('_',' ')}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priorityF} onValueChange={setPriorityF}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Prioridad" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {['baja','media','alta','critica'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Cliente / Producto</TableHead>
              <TableHead>Tipo de falla</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>KM</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-12">No hay incidencias con los filtros aplicados</TableCell></TableRow>}
            {visible.map(c => (
              <TableRow key={c.id} className="hover:bg-muted/40 cursor-pointer" onClick={() => openCase(c.id)}>
                <TableCell><span className="font-mono text-xs font-semibold text-primary">{c.code}</span></TableCell>
                <TableCell><p className="font-medium text-sm">{c.clientName}</p><p className="text-xs text-muted-foreground">{c.productName}</p></TableCell>
                <TableCell className="text-sm">{c.failureType}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(c.date)}</TableCell>
                <TableCell className="text-sm font-mono">{c.mileage.toLocaleString()}</TableCell>
                <TableCell><PriorityBadge priority={c.priority} /></TableCell>
                <TableCell><StatusBadge status={c.status} /></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openCase(c.id); }}><Eye className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="p-3 border-t text-xs text-muted-foreground">{visible.length} de {cases.length} casos</div>
      </div>

      {/* Nuevo caso */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning" />Nueva incidencia</DialogTitle>
            <DialogDescription>El sistema generará un código único al guardar.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Cliente *</Label>
              <Select value={form.clientId} onValueChange={v => setForm({...form, clientId:v, saleId:''})}>
                <SelectTrigger className={errors.clientId?'border-destructive':''}><SelectValue placeholder="Selecciona cliente" /></SelectTrigger>
                <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
              {errors.clientId && <p className="text-xs text-destructive">{errors.clientId}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Producto vendido *</Label>
              <Select value={form.saleId} onValueChange={v => setForm({...form, saleId:v})} disabled={!form.clientId}>
                <SelectTrigger className={errors.saleId?'border-destructive':''}><SelectValue placeholder={form.clientId ? 'Selecciona venta' : 'Selecciona cliente primero'} /></SelectTrigger>
                <SelectContent>{clientSales.map(s => <SelectItem key={s.id} value={s.id}>{s.productName} · {s.invoice}</SelectItem>)}</SelectContent>
              </Select>
              {errors.saleId && <p className="text-xs text-destructive">{errors.saleId}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de falla *</Label>
              <Select value={form.failureType} onValueChange={v => setForm({...form, failureType:v})}>
                <SelectTrigger className={errors.failureType?'border-destructive':''}><SelectValue placeholder="Selecciona" /></SelectTrigger>
                <SelectContent>{failureTypes.filter(f=>f.active).map(f => <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>)}</SelectContent>
              </Select>
              {errors.failureType && <p className="text-xs text-destructive">{errors.failureType}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Prioridad</Label>
              <Select value={form.priority} onValueChange={(v:Priority) => setForm({...form, priority:v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem><SelectItem value="media">Media</SelectItem><SelectItem value="alta">Alta</SelectItem><SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Kilometraje</Label>
              <Input type="number" min="0" value={form.mileage} onChange={e => setForm({...form, mileage: parseInt(e.target.value)||0})} className={errors.mileage?'border-destructive':''} />
            </div>
            <div className="space-y-1.5 md:col-span-1">
              <Label>Comprobante asociado</Label>
              <Input value={form.saleId ? sales.find(s=>s.id===form.saleId)?.invoice || '' : ''} disabled />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Descripción del problema *</Label>
              <Textarea rows={3} value={form.description} onChange={e => setForm({...form, description:e.target.value})} className={errors.description?'border-destructive':''} placeholder="Detalla cuándo ocurre, en qué condiciones, síntomas..." />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Observaciones adicionales</Label>
              <Textarea rows={2} value={form.observations} onChange={e => setForm({...form, observations:e.target.value})} placeholder="Información complementaria, antecedentes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit} className="bg-gradient-primary text-primary-foreground">Generar caso</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!createdCase} onOpenChange={() => setCreatedCase(null)}>
        <DialogContent className="sm:max-w-md text-center">
          {createdCase && <>
            <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-success/10 flex items-center justify-center"><AlertTriangle className="h-7 w-7 text-success" /></div>
            <DialogTitle className="font-display">Caso generado</DialogTitle>
            <DialogDescription>Se ha registrado la incidencia con el siguiente código único:</DialogDescription>
            <div className="my-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-5">
              <p className="text-xs uppercase tracking-widest text-primary font-semibold">Código del caso</p>
              <p className="font-mono font-bold text-2xl text-primary mt-1">{createdCase.code}</p>
            </div>
            <DialogFooter className="sm:justify-center gap-2">
              <Button variant="outline" onClick={() => setCreatedCase(null)}>Cerrar</Button>
              <Button onClick={() => { openCase(createdCase.id); setCreatedCase(null); }} className="bg-gradient-primary text-primary-foreground">Ver caso</Button>
            </DialogFooter>
          </>}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IncidentsPage;
