import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/auth/useAuth';
import { useData } from '@/app/data/useData';
import { PageHeader } from '@/app/ui/page-header';
import { StatusBadge, PriorityBadge, WarrantyBadge } from '@/app/ui/status-badge';
import { Input } from '@/app/ui/input';
import { Button } from '@/app/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/ui/select';
import { Search, FilePlus2, ArrowRight, FolderOpen } from 'lucide-react';
import { formatDate } from '@/app/format/format';

const ClientCases = () => {
  const session = useAuth(s => s.session)!;
  const { cases, users, failureTypes } = useData();
  const me = useMemo(() => users.find(u => u.email === session.email), [users, session.email]);

  const [q, setQ] = useState('');
  const [statusF, setStatusF] = useState('all');
  const [typeF, setTypeF] = useState('all');

  const list = useMemo(() => {
    return cases
      .filter(c => c.clientId === me?.id)
      .filter(c => {
        const m = q.toLowerCase().trim();
        if (m && !`${c.code} ${c.productName} ${c.failureType}`.toLowerCase().includes(m)) return false;
        if (statusF !== 'all' && c.status !== statusF) return false;
        if (typeF !== 'all' && c.failureType !== typeF) return false;
        return true;
      })
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [cases, me, q, statusF, typeF]);

  return (
    <>
      <PageHeader
        kicker="Cliente"
        title="Mis reclamos"
        description="Consulta el avance de cada caso y revisa observaciones, evidencias y resultado final."
        actions={
          <Button asChild className="bg-gradient-primary text-primary-foreground">
            <Link to="/app/cliente/nuevo"><FilePlus2 className="h-4 w-4 mr-2" />Nuevo reclamo</Link>
          </Button>
        }
      />

      <div className="rounded-xl border bg-card shadow-card mb-4 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por código, producto..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <Select value={statusF} onValueChange={setStatusF}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {['recibido','en_revision','observado','validado','resuelto','cerrado','rechazado'].map(s =>
              <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeF} onValueChange={setTypeF}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Tipo de falla" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {failureTypes.map(f => <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border bg-card shadow-card p-12 text-center">
          <FolderOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">No hay reclamos con los filtros aplicados</p>
          <Button asChild variant="outline"><Link to="/app/cliente/nuevo">Registrar nuevo reclamo</Link></Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {list.map(c => (
            <Link to={`/app/cliente/caso/${c.id}`} key={c.id} className="rounded-xl border bg-card shadow-card p-5 hover:shadow-elegant transition group">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs uppercase tracking-widest font-semibold text-primary font-mono">{c.code}</p>
                  <h3 className="font-display font-semibold mt-1">{c.productName}</h3>
                  <p className="text-xs text-muted-foreground">{c.failureType}</p>
                </div>
                <PriorityBadge priority={c.priority} />
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                  <StatusBadge status={c.status} />
                  <WarrantyBadge status={c.warrantyStatus} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Reclamo</p>
                  <p className="text-sm font-medium">{formatDate(c.date)}</p>
                </div>
              </div>
              {c.finalResult && (
                <div className="mt-3 p-2 rounded bg-success/10 border border-success/20 text-xs text-success line-clamp-2">
                  ✓ {c.finalResult}
                </div>
              )}
              <div className="mt-3 text-xs text-primary font-medium flex items-center gap-1 group-hover:translate-x-1 transition">
                Ver seguimiento <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default ClientCases;
