import { useMemo, useState, useEffect } from 'react';
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
import { cn } from '@/app/lib/utils';

const blank: Omit<User, 'id' | 'created_at'> = { name: '', email: '', document: '', phone: '', role: 'cliente', type: 'cliente', active: true };

const UsersPage = () => {
  const { users, addUser, updateUser, toggleUserActive, fetchData } = useData();
  const [q, setQ] = useState('');
  const [roleF, setRoleF] = useState<string>('all');
  const [typeF, setTypeF] = useState<string>('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (editing) {
        await updateUser(editing.id, form);
        toast.success('Usuario actualizado');
      } else {
        await addUser(form);
        toast.success('Usuario creado');
      }
      setOpen(false);
    } catch (error) {
      toast.error('Error al conectar con la base de datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader 
        kicker="Módulo 1" 
        title="Usuarios y clientes" 
        description="Gestiona usuarios internos y clientes externos."
        actions={<Button onClick={openNew} className="bg-gradient-primary text-primary-foreground w-full sm:w-auto"><Plus className="h-4 w-4 mr-2" />Nuevo</Button>} 
      />

      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        {/* FILTROS RESPONSIVOS */}
        <div className="p-4 border-b flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1 w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nombre, correo..." value={q} onChange={e => setQ(e.target.value)} className="pl-9 w-full" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Select value={typeF} onValueChange={setTypeF}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="interno">Interno</SelectItem>
                <SelectItem value="cliente">Cliente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleF} onValueChange={setRoleF}>
              <SelectTrigger className="w-full sm:w-52"><SelectValue placeholder="Rol" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {Object.entries(roleLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* TABLA CON SCROLL HORIZONTAL */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Persona</TableHead>
                <TableHead className="hidden md:table-cell">Documento</TableHead>
                <TableHead className="hidden sm:table-cell">Contacto</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="hidden lg:table-cell">Tipo</TableHead>
                <TableHead className="hidden xl:table-cell">Registro</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-12">Sin resultados</TableCell></TableRow>
              )}
              {filtered.map(u => (
                <TableRow key={u.id} className="hover:bg-muted/40">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                        <AvatarFallback className="bg-gradient-primary text-white text-[10px] sm:text-xs">
                          {u.name.split(' ').map(s => s[0]).slice(0,2).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{u.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-none">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] sm:text-xs hidden md:table-cell">{u.document}</TableCell>
                  <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{u.phone}</TableCell>
                  <TableCell>
                    <span className="text-[10px] sm:text-sm">{roleLabels[u.role]}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className={cn(
                      "text-[10px] px-2 py-1 rounded-md font-medium",
                      u.type === 'interno' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                    )}>
                      {u.type === 'interno' ? 'Interno' : 'Cliente'}
                    </span>
                  </TableCell>
                  <TableCell className="text-[10px] sm:text-xs text-muted-foreground hidden xl:table-cell">
                    {formatDate(u.created_at || (u as any).createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch className="scale-75 sm:scale-100" checked={u.active} onCheckedChange={async () => { await toggleUserActive(u.id); toast.success('Estado actualizado'); }} />
                      <span className={cn("text-[10px] hidden sm:inline", u.active ? 'text-success' : 'text-muted-foreground')}>
                        {u.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => { toggleUserActive(u.id); toast.success('Estado actualizado'); }}><Power className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="p-3 border-t text-[10px] sm:text-xs text-muted-foreground">{filtered.length} de {users.length} registros</div>
      </div>

      {/* MODAL USUARIO RESPONSIVO */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-base sm:text-lg">{editing ? 'Editar registro' : 'Nuevo usuario o cliente'}</DialogTitle>
            <DialogDescription className="text-xs">Los campos con * son obligatorios.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs">Nombre completo *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={cn("text-sm", errors.name && 'border-destructive')} />
              {errors.name && <p className="text-[10px] text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Documento *</Label>
              <Input value={form.document} onChange={e => setForm({ ...form, document: e.target.value })} className={cn("text-sm", errors.document && 'border-destructive')} />
              {errors.document && <p className="text-[10px] text-destructive">{errors.document}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Teléfono *</Label>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={cn("text-sm", errors.phone && 'border-destructive')} />
              {errors.phone && <p className="text-[10px] text-destructive">{errors.phone}</p>}
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs">Correo *</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={cn("text-sm", errors.email && 'border-destructive')} />
              {errors.email && <p className="text-[10px] text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo</Label>
              <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v, role: v === 'cliente' ? 'cliente' : form.role })}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="interno">Interno</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Rol</Label>
              <Select value={form.role} onValueChange={(v: Role) => setForm({ ...form, role: v })}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).filter(([k]) => form.type === 'cliente' ? k === 'cliente' : k !== 'cliente').map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">Cancelar</Button>
            <Button onClick={submit} disabled={loading} className="bg-gradient-primary text-primary-foreground w-full sm:w-auto">
              {loading ? 'Procesando...' : (editing ? 'Guardar' : 'Crear')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UsersPage;