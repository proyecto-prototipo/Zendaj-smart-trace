import { useMemo, useState } from 'react';
import { Plus, Search, Pencil, Eye } from 'lucide-react';
import { useData } from '@/app/data/useData';
import { Sale } from '@/app/types';
import { Button } from '@/app/ui/button';
import { Input } from '@/app/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/ui/dialog';
import { Label } from '@/app/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/ui/table';
import { PageHeader } from '@/app/ui/page-header';
import { toast } from 'sonner';
import { formatDate } from '@/app/format/format';

const blank: Omit<Sale, 'id'> = { productCode: '', productName: '', category: 'Frenos', brand: '', model: '', purchaseDate: new Date().toISOString().slice(0,10), invoice: '', clientId: '', clientName: '', vehicle: { plate: '', brand: '', model: '', year: new Date().getFullYear() }, amount: 0 };

const categories = ['Frenos','Suspensión','Filtros','Eléctrico','Transmisión','Refrigeración','Motor','Carrocería'];

const SalesPage = () => {
  const { sales, addSale, updateSale, users } = useData();
  const clients = users.filter(u => u.type === 'cliente');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Sale | null>(null);
  const [editing, setEditing] = useState<Sale | null>(null);
  const [form, setForm] = useState<Omit<Sale,'id'>>(blank);
  const [errors, setErrors] = useState<Record<string,string>>({});

  const filtered = useMemo(() => sales.filter(s => {
    const m = q.toLowerCase().trim();
    if (m && !`${s.productCode} ${s.productName} ${s.clientName} ${s.invoice} ${s.vehicle.plate}`.toLowerCase().includes(m)) return false;
    if (cat !== 'all' && s.category !== cat) return false;
    return true;
  }), [sales, q, cat]);

  const openNew = () => { setEditing(null); setForm(blank); setErrors({}); setOpen(true); };
  const openEdit = (s: Sale) => { setEditing(s); setForm({ ...s }); setErrors({}); setOpen(true); };

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.productCode.trim()) e.productCode = 'Código obligatorio';
    if (!form.productName.trim()) e.productName = 'Nombre obligatorio';
    if (!form.brand.trim()) e.brand = 'Marca obligatoria';
    if (!form.invoice.trim()) e.invoice = 'Comprobante obligatorio';
    if (!form.clientId) e.clientId = 'Selecciona cliente';
    if (!form.vehicle.plate.trim()) e.plate = 'Placa obligatoria';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    const client = clients.find(c => c.id === form.clientId);
    const final = { ...form, clientName: client?.name || form.clientName };
    if (editing) { updateSale(editing.id, final); toast.success('Venta actualizada'); }
    else { addSale(final); toast.success('Venta registrada'); }
    setOpen(false);
  };

  return (
    <>
      <PageHeader kicker="Módulo 2" title="Productos y ventas asociadas" description="Registra autopartes vendidas y vincúlalas a un cliente y vehículo."
        actions={<Button onClick={openNew} className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Nueva venta</Button>} />

      <div className="rounded-xl border bg-card shadow-card">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por código, producto, cliente, placa..." value={q} onChange={e => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Categoría" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría / Marca</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Comprobante</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Importe</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-12">Sin ventas con los filtros aplicados</TableCell></TableRow>}
            {filtered.map(s => (
              <TableRow key={s.id} className="hover:bg-muted/40">
                <TableCell>
                  <p className="font-medium text-sm">{s.productName}</p>
                  <p className="font-mono text-xs text-muted-foreground">{s.productCode}</p>
                </TableCell>
                <TableCell className="text-sm">{s.category} · <span className="text-muted-foreground">{s.brand}</span></TableCell>
                <TableCell className="text-sm">{s.clientName}</TableCell>
                <TableCell className="text-sm">
                  <p className="font-mono font-semibold">{s.vehicle.plate}</p>
                  <p className="text-xs text-muted-foreground">{s.vehicle.brand} {s.vehicle.model} {s.vehicle.year}</p>
                </TableCell>
                <TableCell className="font-mono text-xs">{s.invoice}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(s.purchaseDate)}</TableCell>
                <TableCell className="text-right font-semibold">S/ {s.amount.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setView(s)}><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="p-3 border-t text-xs text-muted-foreground">{filtered.length} de {sales.length} ventas</div>
      </div>

      {/* Edit/New */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? 'Editar venta' : 'Nueva venta'}</DialogTitle>
            <DialogDescription>Asocia el producto al cliente y al vehículo.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Código de producto *</Label>
              <Input value={form.productCode} onChange={e => setForm({...form, productCode:e.target.value})} className={errors.productCode ? 'border-destructive' : ''} />
              {errors.productCode && <p className="text-xs text-destructive">{errors.productCode}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Nombre del producto *</Label>
              <Input value={form.productName} onChange={e => setForm({...form, productName:e.target.value})} className={errors.productName ? 'border-destructive' : ''} />
              {errors.productName && <p className="text-xs text-destructive">{errors.productName}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Marca *</Label>
              <Input value={form.brand} onChange={e => setForm({...form, brand:e.target.value})} className={errors.brand ? 'border-destructive' : ''} />
              {errors.brand && <p className="text-xs text-destructive">{errors.brand}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Modelo del producto</Label>
              <Input value={form.model} onChange={e => setForm({...form, model:e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label>Importe (S/)</Label>
              <Input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: parseFloat(e.target.value)||0})} />
            </div>
            <div className="space-y-1.5">
              <Label>Fecha de compra</Label>
              <Input type="date" value={form.purchaseDate} onChange={e => setForm({...form, purchaseDate:e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label>Nº de comprobante *</Label>
              <Input value={form.invoice} onChange={e => setForm({...form, invoice:e.target.value})} className={errors.invoice ? 'border-destructive' : ''} />
              {errors.invoice && <p className="text-xs text-destructive">{errors.invoice}</p>}
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label>Cliente *</Label>
              <Select value={form.clientId} onValueChange={v => setForm({...form, clientId: v})}>
                <SelectTrigger className={errors.clientId ? 'border-destructive' : ''}><SelectValue placeholder="Selecciona cliente" /></SelectTrigger>
                <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name} · {c.document}</SelectItem>)}</SelectContent>
              </Select>
              {errors.clientId && <p className="text-xs text-destructive">{errors.clientId}</p>}
            </div>
            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3 p-3 rounded-lg border bg-muted/30">
              <p className="col-span-2 md:col-span-4 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Datos del vehículo</p>
              <div><Label className="text-xs">Placa *</Label><Input value={form.vehicle.plate} onChange={e => setForm({...form, vehicle:{...form.vehicle, plate:e.target.value.toUpperCase()}})} className={errors.plate?'border-destructive':''} /></div>
              <div><Label className="text-xs">Marca</Label><Input value={form.vehicle.brand} onChange={e => setForm({...form, vehicle:{...form.vehicle, brand:e.target.value}})} /></div>
              <div><Label className="text-xs">Modelo</Label><Input value={form.vehicle.model} onChange={e => setForm({...form, vehicle:{...form.vehicle, model:e.target.value}})} /></div>
              <div><Label className="text-xs">Año</Label><Input type="number" value={form.vehicle.year} onChange={e => setForm({...form, vehicle:{...form.vehicle, year:parseInt(e.target.value)||0}})} /></div>
              {errors.plate && <p className="col-span-4 text-xs text-destructive">{errors.plate}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit} className="bg-gradient-primary text-primary-foreground">{editing ? 'Guardar cambios' : 'Registrar venta'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View */}
      <Dialog open={!!view} onOpenChange={() => setView(null)}>
        <DialogContent className="sm:max-w-lg">
          {view && <>
            <DialogHeader>
              <DialogTitle className="font-display">{view.productName}</DialogTitle>
              <DialogDescription className="font-mono">{view.productCode}</DialogDescription>
            </DialogHeader>
            <dl className="grid grid-cols-2 gap-3 text-sm py-3">
              <div><dt className="text-xs text-muted-foreground">Categoría</dt><dd className="font-medium">{view.category}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Marca</dt><dd className="font-medium">{view.brand}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Cliente</dt><dd className="font-medium">{view.clientName}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Comprobante</dt><dd className="font-mono">{view.invoice}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Vehículo</dt><dd className="font-medium">{view.vehicle.brand} {view.vehicle.model} {view.vehicle.year}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Placa</dt><dd className="font-mono font-semibold">{view.vehicle.plate}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Fecha</dt><dd>{formatDate(view.purchaseDate)}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Importe</dt><dd className="font-semibold">S/ {view.amount.toFixed(2)}</dd></div>
            </dl>
          </>}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SalesPage;
