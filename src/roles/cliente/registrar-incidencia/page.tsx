import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/auth/useAuth';
import { useData } from '@/app/data/useData';
import { Priority, Case } from '@/app/types';
import { PageHeader } from '@/app/ui/page-header';
import { Button } from '@/app/ui/button';
import { Input } from '@/app/ui/input';
import { Label } from '@/app/ui/label';
import { Textarea } from '@/app/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/ui/select';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/app/ui/dialog';
import { UploadCloud, FilePlus2, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/app/lib/utils';
import { formatBytes } from '@/app/format/format';

const ClientNewIncident = () => {
  const session = useAuth(s => s.session)!;
  const nav = useNavigate();
  const { sales, users, failureTypes, addCase, addEvidence } = useData();
  const me = useMemo(() => users.find(u => u.email === session.email), [users, session.email]);
  const mySales = useMemo(() => sales.filter(s => s.clientId === me?.id), [sales, me]);

  const [form, setForm] = useState({
    saleId: '', failureType: '', description: '', observations: '',
    mileage: 0, priority: 'media' as Priority,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [drag, setDrag] = useState(false);
  const [created, setCreated] = useState<Case | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sale = mySales.find(s => s.id === form.saleId);

  const onFiles = (fl: FileList | null) => {
    if (!fl) return;
    setFiles(prev => [...prev, ...Array.from(fl)]);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.saleId) e.saleId = 'Selecciona el producto que presenta la falla';
    if (!form.failureType) e.failureType = 'Indica el tipo de falla';
    if (!form.description.trim() || form.description.length < 15) e.description = 'Describe el problema (mín. 15 caracteres)';
    if (form.mileage < 0) e.mileage = 'Kilometraje inválido';
    if (files.length === 0) e.files = 'Adjunta al menos una evidencia inicial';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    if (!sale || !me) return;
    const c = addCase({
      date: new Date().toISOString().slice(0, 10),
      clientId: me.id, clientName: me.name,
      saleId: sale.id, productName: sale.productName,
      failureType: form.failureType, description: form.description,
      observations: form.observations, invoice: sale.invoice,
      mileage: form.mileage, priority: form.priority,
      createdBy: me.name,
    } as any, { name: me.name, role: 'cliente' });

    files.forEach(f => {
      const url = f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined;
      const type: 'foto' | 'documento' | 'comprobante' = f.type.startsWith('image/') ? 'foto'
        : f.name.toLowerCase().includes('comprobante') ? 'comprobante' : 'documento';
      addEvidence({ caseId: c.id, name: f.name, type, size: f.size, uploadedBy: me.name, url });
    });

    toast.success('Reclamo registrado correctamente');
    setCreated(c);
    setForm({ saleId: '', failureType: '', description: '', observations: '', mileage: 0, priority: 'media' });
    setFiles([]);
  };

  return (
    <>
      <PageHeader
        kicker="Cliente"
        title="Registrar incidencia"
        description="Completa los datos del producto, describe la falla y adjunta evidencia inicial. El sistema generará un código único."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card shadow-card p-6 space-y-5">
            <h3 className="font-display font-semibold">Datos del producto</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label>Producto o autoparte adquirida *</Label>
                <Select value={form.saleId} onValueChange={v => setForm({ ...form, saleId: v })}>
                  <SelectTrigger className={errors.saleId ? 'border-destructive' : ''}>
                    <SelectValue placeholder={mySales.length ? 'Selecciona tu compra' : 'No tienes compras registradas'} />
                  </SelectTrigger>
                  <SelectContent>
                    {mySales.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.productName} · {s.invoice}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.saleId && <p className="text-xs text-destructive">{errors.saleId}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Fecha de compra</Label>
                <Input value={sale?.purchaseDate || ''} disabled placeholder="Se completa al elegir producto" />
              </div>
              <div className="space-y-1.5">
                <Label>Número de comprobante</Label>
                <Input value={sale?.invoice || ''} disabled placeholder="—" />
              </div>
              <div className="space-y-1.5">
                <Label>Vehículo</Label>
                <Input value={sale ? `${sale.vehicle.brand} ${sale.vehicle.model} · ${sale.vehicle.plate}` : ''} disabled placeholder="—" />
              </div>
              <div className="space-y-1.5">
                <Label>Kilometraje actual</Label>
                <Input type="number" min={0} value={form.mileage} onChange={e => setForm({ ...form, mileage: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-card p-6 space-y-5">
            <h3 className="font-display font-semibold">Detalle de la falla</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tipo de falla *</Label>
                <Select value={form.failureType} onValueChange={v => setForm({ ...form, failureType: v })}>
                  <SelectTrigger className={errors.failureType ? 'border-destructive' : ''}><SelectValue placeholder="Selecciona" /></SelectTrigger>
                  <SelectContent>{failureTypes.filter(f => f.active).map(f => <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>)}</SelectContent>
                </Select>
                {errors.failureType && <p className="text-xs text-destructive">{errors.failureType}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Prioridad sugerida</Label>
                <Select value={form.priority} onValueChange={(v: Priority) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Descripción del problema *</Label>
                <Textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Cuéntanos cuándo aparece la falla, en qué condiciones y los síntomas observados..." className={errors.description ? 'border-destructive' : ''} />
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Observaciones adicionales</Label>
                <Textarea rows={3} value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} placeholder="Información que pueda ayudar a la evaluación..." />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-card shadow-card p-6">
            <h3 className="font-display font-semibold mb-3">Evidencia inicial *</h3>
            <p className="text-xs text-muted-foreground mb-3">Adjunta fotos del producto, comprobantes o documentos.</p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
              onClick={() => inputRef.current?.click()}
              className={cn('rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition',
                drag ? 'border-primary bg-primary/5' : errors.files ? 'border-destructive/50' : 'border-border hover:border-primary/50 hover:bg-muted/40')}
            >
              <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Arrastra archivos o <span className="text-primary">selecciónalos</span></p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, PDF</p>
              <input ref={inputRef} type="file" multiple className="hidden" onChange={e => onFiles(e.target.files)} />
            </div>
            {errors.files && <p className="text-xs text-destructive mt-2">{errors.files}</p>}
            {files.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-muted/40 rounded p-2">
                    <span className="truncate flex-1">{f.name}</span>
                    <span className="text-muted-foreground mx-2">{formatBytes(f.size)}</span>
                    <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-accent/5 p-5 text-sm">
            <p className="font-medium mb-1">¿Qué pasa después?</p>
            <p className="text-xs text-muted-foreground">Tu reclamo será revisado por el asesor postventa y luego validado por el técnico evaluador. Podrás ver cada paso desde "Mis reclamos".</p>
          </div>

          <Button onClick={submit} className="w-full bg-gradient-primary text-primary-foreground" size="lg">
            <FilePlus2 className="h-4 w-4 mr-2" />Registrar reclamo
          </Button>
        </div>
      </div>

      <Dialog open={!!created} onOpenChange={() => setCreated(null)}>
        <DialogContent className="sm:max-w-md text-center">
          {created && <>
            <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-success/10 flex items-center justify-center"><CheckCircle2 className="h-7 w-7 text-success" /></div>
            <DialogTitle className="font-display">¡Reclamo registrado!</DialogTitle>
            <DialogDescription>Hemos generado un código único para hacer seguimiento a tu caso.</DialogDescription>
            <div className="my-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-5">
              <p className="text-xs uppercase tracking-widest text-primary font-semibold">Código del caso</p>
              <p className="font-mono font-bold text-2xl text-primary mt-1">{created.code}</p>
            </div>
            <DialogFooter className="sm:justify-center gap-2">
              <Button variant="outline" onClick={() => { setCreated(null); nav('/app/cliente/reclamos'); }}>Ver mis reclamos</Button>
              <Button onClick={() => { nav(`/app/cliente/caso/${created.id}`); setCreated(null); }} className="bg-gradient-primary text-primary-foreground">Abrir caso</Button>
            </DialogFooter>
          </>}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientNewIncident;
