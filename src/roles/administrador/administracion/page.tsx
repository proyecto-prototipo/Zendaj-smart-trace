import { useState } from 'react';
import { useData } from '@/app/data/useData';
import { Button } from '@/app/ui/button';
import { Input } from '@/app/ui/input';
import { Label } from '@/app/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/ui/table';
import { PageHeader } from '@/app/ui/page-header';
import { Switch } from '@/app/ui/switch';
import { Plus, Pencil, Settings } from 'lucide-react';
import { toast } from 'sonner';

const AdminPage = () => {
  const { failureTypes, statuses, addFailureType, toggleFailureType, updateFailureType, toggleStatus, reset } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [sev, setSev] = useState<'baja'|'media'|'alta'>('media');

  const openNew = () => { setEditing(null); setName(''); setSev('media'); setOpen(true); };
  const openEdit = (id: string) => { const f = failureTypes.find(x => x.id === id)!; setEditing(id); setName(f.name); setSev(f.severity); setOpen(true); };

  const submit = () => {
    if (!name.trim()) { toast.error('Nombre obligatorio'); return; }
    if (editing) { updateFailureType(editing, name, sev); toast.success('Actualizado'); }
    else { addFailureType(name, sev); toast.success('Creado'); }
    setOpen(false);
  };

  return (
    <>
      <PageHeader kicker="Módulo 8" title="Administración y configuración" description="Parámetros del sistema y catálogos."
        actions={<Button variant="outline" onClick={() => { reset(); toast.success('Datos restablecidos'); }}><Settings className="h-4 w-4 mr-2" />Restablecer demo</Button>} />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card shadow-card">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-display font-semibold">Tipos de incidencia</h3>
            <Button size="sm" onClick={openNew} className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1" />Nuevo</Button>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Severidad</TableHead><TableHead>Estado</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {failureTypes.map(f => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell><span className="text-xs px-2 py-0.5 rounded bg-muted capitalize">{f.severity}</span></TableCell>
                  <TableCell><Switch checked={f.active} onCheckedChange={() => { toggleFailureType(f.id); toast.success('Estado actualizado'); }} /></TableCell>
                  <TableCell><Button size="icon" variant="ghost" onClick={() => openEdit(f.id)}><Pencil className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-xl border bg-card shadow-card">
          <div className="p-4 border-b"><h3 className="font-display font-semibold">Estados del caso</h3></div>
          <Table>
            <TableHeader><TableRow><TableHead>Estado</TableHead><TableHead>Clave</TableHead><TableHead>Activo</TableHead></TableRow></TableHeader>
            <TableBody>
              {statuses.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.label}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{s.key}</TableCell>
                  <TableCell><Switch checked={s.active} onCheckedChange={() => { toggleStatus(s.id); toast.success('Estado actualizado'); }} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-xl border bg-card shadow-card p-5 lg:col-span-2">
          <h3 className="font-display font-semibold mb-3">Criterios básicos de garantía</h3>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              'Comprobante de compra válido y vigente',
              'Producto dentro del período de garantía declarado',
              'Falla atribuible al producto y no a terceros',
              'Sin signos de mal uso, golpes o instalación incorrecta',
              'Evidencia técnica suficiente para evaluar',
              'Reclamo registrado dentro de los 30 días de detectada la falla',
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-lg border bg-background">
                <Switch defaultChecked />
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Nuevo'} tipo de incidencia</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Nombre</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>Severidad</Label><Select value={sev} onValueChange={(v: any) => setSev(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
              <SelectItem value="baja">Baja</SelectItem><SelectItem value="media">Media</SelectItem><SelectItem value="alta">Alta</SelectItem>
            </SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={submit} className="bg-gradient-primary text-primary-foreground">Guardar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPage;
