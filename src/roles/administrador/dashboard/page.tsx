import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, ShieldCheck, TrendingUp, FileText } from 'lucide-react';
import { useData } from '@/app/data/useData';
import { useAuth, roleLabels } from '@/app/auth/useAuth';
import { PageHeader } from '@/app/ui/page-header';
import { StatusBadge } from '@/app/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/ui/select';
import { ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { CaseStatus } from '@/app/types';
import { formatDate } from '@/app/format/format';

const KpiCard = ({ icon: Icon, label, value, hint, gradient }: any) => (
  <div className="rounded-xl border bg-card shadow-card p-5 relative overflow-hidden">
    <div className={`absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-20 ${gradient}`} />
    <div className="relative">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${gradient} text-white`}><Icon className="h-5 w-5" /></div>
      <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold truncate">{label}</p>
      <p className="font-display text-2xl lg:text-3xl font-bold mt-1">{value}</p>
      {hint && <p className="text-[10px] lg:text-xs text-muted-foreground mt-1 truncate">{hint}</p>}
    </div>
  </div>
);

const COLORS = ['hsl(218 92% 52%)', 'hsl(174 80% 42%)', 'hsl(38 95% 55%)', 'hsl(0 84% 60%)', 'hsl(152 70% 42%)', 'hsl(200 90% 50%)', 'hsl(280 70% 55%)'];

const DashboardPage = () => {
  const { cases } = useData();
  const session = useAuth(s => s.session)!;
  const [statusF, setStatusF] = useState<string>('all');
  const [period, setPeriod] = useState('all');

  const filtered = useMemo(() => cases.filter(c => {
    if (statusF !== 'all' && c.status !== statusF) return false;
    if (period !== 'all') {
      const days = parseInt(period);
      const cutoff = Date.now() - days * 86400000;
      if (+new Date(c.date) < cutoff) return false;
    }
    return true;
  }), [cases, statusF, period]);

  const kpis = useMemo(() => {
    const open = filtered.filter(c => !['cerrado','resuelto','rechazado'].includes(c.status)).length;
    const closed = filtered.filter(c => ['cerrado','resuelto'].includes(c.status)).length;
    const validated = filtered.filter(c => c.warrantyStatus === 'validado' || (c as any).warranty_status === 'validado').length;
    
    return {
      total: filtered.length,
      open, closed, validated,
      avgTime: '4.2 días',
      slaPercent: 92,
    };
  }, [filtered]);

  const byStatus = useMemo(() => {
    const m: Record<string, number> = {};
    filtered.forEach(c => m[c.status] = (m[c.status] || 0) + 1);
    return Object.entries(m).map(([name, value]) => ({ name: name.replace('_',' '), value }));
  }, [filtered]);

  const byFailure = useMemo(() => {
    const m: Record<string, number> = {};
    filtered.forEach(c => m[c.failure_type] = (m[c.failure_type] || 0) + 1);
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value).slice(0,6);
  }, [filtered]);

  const trend = useMemo(() => {
    const months: Record<string, { mes: string; abiertos: number; cerrados: number }> = {};
    filtered.forEach(c => {
      const key = c.date.slice(0, 7);
      if (!months[key]) months[key] = { mes: key, abiertos: 0, cerrados: 0 };
      if (['cerrado','resuelto'].includes(c.status)) months[key].cerrados++; else months[key].abiertos++;
    });
    return Object.values(months).sort((a,b)=>a.mes.localeCompare(b.mes));
  }, [filtered]);

  const recent = filtered.slice(0, 6);
  const titleByRole: Record<string, string> = {
    administrador: 'Dashboard general',
    asesor: 'Dashboard operativo',
    tecnico: 'Dashboard técnico',
    gerencia: 'Dashboard ejecutivo',
    cliente: 'Mi panel',
  };

  return (
    <>
      <PageHeader 
        kicker={`Bienvenido, ${session.name.split(' ')[0]}`} 
        title={titleByRole[session.role]} 
        description={`Panel adaptado al rol ${roleLabels[session.role]}.`}
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Periodo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo</SelectItem>
                <SelectItem value="7">Últimos 7 días</SelectItem>
                <SelectItem value="30">Últimos 30 días</SelectItem>
                <SelectItem value="90">Últimos 90 días</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusF} onValueChange={setStatusF}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {['recibido','en_revision','observado','validado','resuelto','cerrado','rechazado'].map(s => (
                  <SelectItem key={s} value={s}>{s.replace('_',' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* KPIs: 2 columnas en móvil, 4 en escritorio */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <KpiCard icon={AlertTriangle} label="Total incidencias" value={kpis.total} hint="En el periodo" gradient="bg-gradient-to-br from-primary to-primary-glow" />
        <KpiCard icon={Clock} label="Casos abiertos" value={kpis.open} hint="Requieren acción" gradient="bg-gradient-to-br from-amber-500 to-orange-500" />
        <KpiCard icon={CheckCircle2} label="Casos cerrados" value={kpis.closed} hint="Resueltos o cerrados" gradient="bg-gradient-to-br from-emerald-500 to-teal-500" />
        <KpiCard icon={ShieldCheck} label="Garantías validadas" value={kpis.validated} hint={`SLA ${kpis.slaPercent}%`} gradient="bg-gradient-to-br from-accent to-cyan-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="rounded-xl border bg-card shadow-card p-4 lg:p-5 lg:col-span-2 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <h3 className="font-display font-semibold">Evolución mensual</h3>
            <span className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" />Promedio: {kpis.avgTime}</span>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAbiertos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCerrados" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 20 }} />
                <Area type="monotone" dataKey="abiertos" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorAbiertos)" />
                <Area type="monotone" dataKey="cerrados" stroke="hsl(var(--accent))" strokeWidth={3} fillOpacity={1} fill="url(#colorCerrados)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-card p-4 lg:p-5">
          <h3 className="font-display font-semibold mb-4">Casos por estado</h3>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border bg-card shadow-card p-4 lg:p-5 lg:col-span-2 overflow-hidden">
          <h3 className="font-display font-semibold mb-4">Tipos de falla más frecuentes</h3>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byFailure} layout="vertical" margin={{ left: -20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} hide />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} width={100} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0,8,8,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-card p-4 lg:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold">Casos recientes</h3>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            {recent.map(c => (
              <Link to={`/app/trazabilidad/${c.id}`} key={c.id} className="block p-3 rounded-lg hover:bg-muted/40 border border-transparent hover:border-border transition">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-semibold text-primary">{c.code}</span>
                  <StatusBadge status={c.status as CaseStatus} />
                </div>
                <p className="text-sm font-medium mt-1 truncate">{c.product_name}</p>
                <p className="text-[10px] text-muted-foreground">{c.client_name} · {formatDate(c.date)}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;