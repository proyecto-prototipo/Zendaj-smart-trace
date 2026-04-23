import { useMemo, useState } from 'react';
import { useData } from '@/app/data/useData';
import { useAuth } from '@/app/auth/useAuth';
import { PageHeader } from '@/app/ui/page-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/ui/select';
import { Button } from '@/app/ui/button';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line,
} from 'recharts';
import { AlertTriangle, CheckCircle2, Clock, ShieldCheck, TrendingUp, TrendingDown, Sparkles, ArrowRight, Target } from 'lucide-react';

const COLORS = ['hsl(218 92% 52%)', 'hsl(174 80% 42%)', 'hsl(38 95% 55%)', 'hsl(0 84% 60%)', 'hsl(152 70% 42%)', 'hsl(280 70% 55%)', 'hsl(200 90% 50%)', 'hsl(15 88% 56%)'];

const KpiCard = ({ icon: Icon, label, value, hint, trend, gradient }: any) => (
  <div className="rounded-2xl border bg-card shadow-card p-5 relative overflow-hidden">
    <div className={`absolute -top-8 -right-8 h-28 w-28 rounded-full opacity-20 ${gradient}`} />
    <div className="relative">
      <div className="flex items-center justify-between">
        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${gradient} text-white shadow-glow`}><Icon className="h-5 w-5" /></div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold flex items-center gap-1 ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
      <p className="font-display text-3xl font-bold mt-1">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  </div>
);

const ExecutiveDashboard = () => {
  const { cases } = useData();
  const session = useAuth(s => s.session)!;
  const [period, setPeriod] = useState('all');

  const filtered = useMemo(() => cases.filter(c => {
    if (period === 'all') return true;
    const days = parseInt(period);
    return +new Date(c.date) >= Date.now() - days * 86400000;
  }), [cases, period]);

  const kpis = useMemo(() => {
    const total = filtered.length;
    const open = filtered.filter(c => !['cerrado', 'resuelto', 'rechazado'].includes(c.status)).length;
    const closed = filtered.filter(c => ['cerrado', 'resuelto'].includes(c.status)).length;
    const validated = filtered.filter(c => c.warrantyStatus === 'validado').length;
    const resolution = total ? Math.round((closed / total) * 100) : 0;
    return { total, open, closed, validated, resolution };
  }, [filtered]);

  const trendArea = useMemo(() => {
    const m: Record<string, { mes: string; volumen: number; cerrados: number }> = {};
    filtered.forEach(c => {
      const k = c.date.slice(0, 7);
      if (!m[k]) m[k] = { mes: k, volumen: 0, cerrados: 0 };
      m[k].volumen++;
      if (['cerrado', 'resuelto'].includes(c.status)) m[k].cerrados++;
    });
    return Object.values(m).sort((a, b) => a.mes.localeCompare(b.mes));
  }, [filtered]);

  const failureMix = useMemo(() => {
    const m: Record<string, number> = {};
    filtered.forEach(c => m[c.failureType] = (m[c.failureType] || 0) + 1);
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  return (
    <>
      <PageHeader
        kicker={`Bienvenida, ${session.name.split(' ')[0]}`}
        title="Dashboard ejecutivo"
        description="Visión consolidada del desempeño postventa, garantía y trazabilidad de incidencias."
        actions={
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo el periodo</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
              <SelectItem value="180">Últimos 6 meses</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard icon={AlertTriangle} label="Volumen total" value={kpis.total} hint="Incidencias registradas" trend={12} gradient="bg-gradient-to-br from-primary to-primary-glow" />
        <KpiCard icon={Clock} label="En proceso" value={kpis.open} hint="Pendientes" trend={-8} gradient="bg-gradient-to-br from-amber-500 to-orange-500" />
        <KpiCard icon={CheckCircle2} label="Resolución" value={`${kpis.resolution}%`} hint={`${kpis.closed} cerrados`} trend={6} gradient="bg-gradient-to-br from-emerald-500 to-teal-500" />
        <KpiCard icon={ShieldCheck} label="Garantías" value={kpis.validated} hint="Validadas" trend={4} gradient="bg-gradient-to-br from-accent to-cyan-400" />
        <KpiCard icon={Target} label="Tiempo promedio" value="4.2 d" hint="SLA 92%" trend={-15} gradient="bg-gradient-to-br from-violet-500 to-fuchsia-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="rounded-2xl border bg-card shadow-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold">Volumen y resolución de incidencias</h3>
              <p className="text-xs text-muted-foreground">Evolución mensual de casos recibidos vs resueltos.</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendArea}>
              <defs>
                <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" name="Volumen" dataKey="volumen" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#gv)" />
              <Area type="monotone" name="Resueltos" dataKey="cerrados" stroke="hsl(var(--accent))" strokeWidth={2.5} fill="url(#gc)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-accent/5 shadow-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-display font-semibold">Oportunidades de mejora</h3>
          </div>
          <div className="space-y-3">
            {failureMix.slice(0, 3).map((f, i) => {
              const pct = Math.round((f.value / Math.max(filtered.length, 1)) * 100);
              return (
                <div key={f.name} className="rounded-xl border bg-card p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium truncate">{f.name}</p>
                    <span className="text-xs font-semibold text-primary">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    {i === 0 && 'Priorizar revisión técnica del proveedor'}
                    {i === 1 && 'Reforzar capacitación al instalador'}
                    {i === 2 && 'Actualizar control de calidad de lote'}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button asChild size="sm" variant="outline"><Link to="/app/reportes/fallas">Tipos de falla<ArrowRight className="h-3 w-3 ml-1" /></Link></Button>
            <Button asChild size="sm" variant="outline"><Link to="/app/reportes/tiempos">Tiempos<ArrowRight className="h-3 w-3 ml-1" /></Link></Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card shadow-card p-5">
          <h3 className="font-display font-semibold mb-3">Mix de tipos de falla</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={failureMix} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {failureMix.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border bg-card shadow-card p-5">
          <h3 className="font-display font-semibold mb-3">Tendencia de tiempo de respuesta (vista rápida)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={trendArea.map((d, i) => ({ ...d, tiempo: 5 + Math.sin(i) * 1.2 + (i % 3) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar name="Días promedio" dataKey="tiempo" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              <Line name="Tendencia" type="monotone" dataKey="tiempo" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default ExecutiveDashboard;
