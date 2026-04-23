import { useMemo, useState } from 'react';
import { Plus, Search, Pencil, Power } from 'lucide-react';
import { useData } from '@/app/data/useData';
import { Role, User } from '@/app/types';
import { Button } from '@/app/ui/button';
import { Input } from '@/app/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/ui/dialog';
import { Label } from '@/app/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/ui/table';
import { PageHeader } from '@/app/ui/page-header';
import { roleLabels } from '@/app/auth/useAuth';
import { Avatar, AvatarFallback } from '@/app/ui/avatar';
import { toast } from 'sonner';
import { Switch } from '@/app/ui/switch';
import { formatDate } from '@/app/format/format';

const blank: Omit<User, 'id' | 'createdAt'> = { name: '', email: '', document: '', phone: '', role: 'cliente', type: 'cliente', active: true };

const UsersPage = () => {
  const { users, addUser, updateUser, toggleUserActive } = useData();
  const [q, setQ] = useState('');
  const [roleF, setRoleF] = useState<string>('all');
  const [typeF, setTypeF] = useState<string>('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => users.filter(u => {
    const m = q.toLowerCase().trim();
    if (m && !`${u.name} ${u.email} ${u.document}`.toLowerCase().includes(m)) return false;
    if (roleF !== 'all' && u.role !== roleF) return false;
    if (typeF !== 'all' && u.type !== typeF) return false;
    return true;
  }), [users, q, roleF, typeF]);

  const openNew = () => { setEditing(null); setForm(blank); setErrors({}); setOpen(true); };
  const openEdit = (u: User) => { setEditing(u); setForm({ ...u }); setErrors({}); setOpen(true); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nombre obligatorio';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo inválido';
    if (!form.document.trim()) e.document = 'Documento obligatorio';
    if (!form.phone.trim()) e.phone = 'Teléfono obligatorio';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    if (editing) { updateUser(editing.id, form); toast.success('Usuario actualizado'); }
    else { addUser(form); toast.success('Usuario creado'); }
    setOpen(false);
  };

  return (
    <>
      <PageHeader kicker="Módulo 1" title="Usuarios y clientes" description="Gestiona usuarios internos y clientes externos del sistema."
        actions={<Button onClick={openNew} className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Nuevo</Button>} />

      <div className="rounded-xl border bg-card shadow-card">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nombre, correo o documento..." value={q} onChange={e => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={typeF} onValueChange={setTypeF}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="interno">Interno</SelectItem>
              <SelectItem value="cliente">Cliente</SelectItem>
            </SelectContent>
          </Select>
          <Select value={roleF} onValueChange={setRoleF}>
            <SelectTrigger className="w-52"><SelectValue placeholder="Rol" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="interno">Administrador</SelectItem>
              <SelectItem value="cliente">Asesor</SelectItem>
              <SelectItem value="interno">Cliente</SelectItem>
              <SelectItem value="cliente">Gerencia</SelectItem>
              <SelectItem value="cliente">Técnico</SelectItem>
              {Object.entries(roleLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Persona</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-12">Sin resultados con los filtros aplicados</TableCell></TableRow>}
            {filtered.map(u => (
              <TableRow key={u.id} className="hover:bg-muted/40">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9"><AvatarFallback className="bg-gradient-primary text-white text-xs">{u.name.split(' ').map(s => s[0]).slice(0,2).join('')}</AvatarFallback></Avatar>
                    <div><p className="font-medium text-sm">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{u.document}</TableCell>
                <TableCell className="text-sm">{u.phone}</TableCell>
                <TableCell><span className="text-sm">{roleLabels[u.role]}</span></TableCell>
                <TableCell><span className={`text-xs px-2 py-1 rounded-md ${u.type === 'interno' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>{u.type === 'interno' ? 'Interno' : 'Cliente'}</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch checked={u.active} onCheckedChange={() => { toggleUserActive(u.id); toast.success(`Usuario ${u.active ? 'desactivado' : 'activado'}`); }} />
                    <span className={`text-xs ${u.active ? 'text-success' : 'text-muted-foreground'}`}>{u.active ? 'Activo' : 'Inactivo'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(u)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { toggleUserActive(u.id); toast.success('Estado actualizado'); }}><Power className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="p-3 border-t text-xs text-muted-foreground">{filtered.length} de {users.length} registros</div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? 'Editar registro' : 'Nuevo usuario o cliente'}</DialogTitle>
            <DialogDescription>Completa los datos. Los campos con * son obligatorios.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="md:col-span-2 space-y-1.5">
              <Label>Nombre completo *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={errors.name ? 'border-destructive' : ''} />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Documento *</Label>
              <Input value={form.document} onChange={e => setForm({ ...form, document: e.target.value })} className={errors.document ? 'border-destructive' : ''} />
              {errors.document && <p className="text-xs text-destructive">{errors.document}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Teléfono *</Label>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={errors.phone ? 'border-destructive' : ''} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label>Correo *</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={errors.email ? 'border-destructive' : ''} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v, role: v === 'cliente' ? 'cliente' : form.role })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="interno">Interno</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Select value={form.role} onValueChange={(v: Role) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).filter(([k]) => form.type === 'cliente' ? k === 'cliente' : k !== 'cliente').map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit} className="bg-gradient-primary text-primary-foreground">{editing ? 'Guardar cambios' : 'Crear registro'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UsersPage;
