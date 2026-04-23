import { useMemo, useState } from 'react';
import { useData } from '@/app/data/useData';
import { PageHeader } from '@/app/ui/page-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/ui/select';
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Clock, Trophy, AlertTriangle, Activity } from 'lucide-react';

// Genera serie determinística por mes en base a casos
const buildSeries = (cases: any[], failure: string, status: string) => {
  const months: Record<string, { mes: string; tiempos: number[] }> = {};
  cases.forEach(c => {
    if (failure !== 'all' && c.failureType !== failure) return;
    if (status !== 'all' && c.status !== status) return;
    const k = c.date.slice(0, 7);
    if (!months[k]) months[k] = { mes: k, tiempos: [] };
    // tiempo simulado basado en prioridad y estado (determinístico)
    const base = c.priority === 'critica' ? 2 : c.priority === 'alta' ? 4 : c.priority === 'media' ? 6 : 8;
    const offset = ['cerrado', 'resuelto'].includes(c.status) ? -1 : 1.5;
    months[k].tiempos.push(Math.max(1, base + offset));
  });
  return Object.values(months)
    .sort((a, b) => a.mes.localeCompare(b.mes))
    .map(m => ({
      mes: m.mes,
      promedio: +(m.tiempos.reduce((s, x) => s + x, 0) / m.tiempos.length).toFixed(1),
      casos: m.tiempos.length,
    }));
};

// EMA (exponential moving average)
const computeEMA = (data: { promedio: number }[], period = 3) => {
  const k = 2 / (period + 1);
  let prev: number | null = null;
  return data.map(d => {
    const v = prev === null ? d.promedio : d.promedio * k + prev * (1 - k);
    prev = v;
    return +v.toFixed(2);
  });
};

const Kpi = ({ icon: Icon, label, value, hint, trend, gradient }: any) => (
  <div className="rounded-2xl border bg-card shadow-card p-5 relative overflow-hidden">
    <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-20 ${gradient}`} />
    <div className="relative">
      <div className="flex items-center justify-between">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${gradient} text-white shadow-glow`}><Icon className="h-5 w-5" /></div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold flex items-center gap-1 ${trend <= 0 ? 'text-success' : 'text-destructive'}`}>
            {trend <= 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
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

const ResponseTimeReport = () => {
  const { cases, failureTypes } = useData();
  const [period, setPeriod] = useState('all');
  const [failure, setFailure] = useState('all');
  const [statusF, setStatusF] = useState('all');

  const filteredCases = useMemo(() => cases.filter(c => {
    if (period === 'all') return true;
    const days = parseInt(period);
    return +new Date(c.date) >= Date.now() - days * 86400000;
  }), [cases, period]);

  const series = useMemo(() => buildSeries(filteredCases, failure, statusF), [filteredCases, failure, statusF]);
  const ema = useMemo(() => computeEMA(series, 3), [series]);
  const data = series.map((d, i) => ({ ...d, ema: ema[i] }));

  const tiempos = data.map(d => d.promedio);
  const avg = tiempos.length ? +(tiempos.reduce((s, x) => s + x, 0) / tiempos.length).toFixed(1) : 0;
  const best = tiempos.length ? Math.min(...tiempos) : 0;
  const worst = tiempos.length ? Math.max(...tiempos) : 0;
  const trendPct = data.length >= 2
    ? +(((data[data.length - 1].ema - data[0].ema) / Math.max(data[0].ema, 0.01)) * 100).toFixed(1)
    : 0;

  return (
    <>
      <PageHeader
        kicker="Reporte ejecutivo"
        title="Tiempo de respuesta"
        description="Análisis de tiempos de atención por periodo con línea de tendencia EMA (media móvil exponencial)."
        actions={
          <>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo</SelectItem>
                <SelectItem value="90">Últimos 90 días</SelectItem>
                <SelectItem value="180">Últimos 6 meses</SelectItem>
                <SelectItem value="365">Último año</SelectItem>
              </SelectContent>
            </Select>
            <Select value={failure} onValueChange={setFailure}>
              <SelectTrigger className="w-52"><SelectValue placeholder="Tipo de falla" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fallas</SelectItem>
                {failureTypes.map(f => <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusF} onValueChange={setStatusF}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {['recibido','en_revision','observado','validado','resuelto','cerrado','rechazado'].map(s =>
                  <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi icon={Clock} label="Tiempo promedio" value={`${avg} d`} hint="Periodo seleccionado" trend={-9} gradient="bg-gradient-to-br from-primary to-primary-glow" />
        <Kpi icon={Trophy} label="Mejor tiempo" value={`${best} d`} hint="Mes más rápido" gradient="bg-gradient-to-br from-emerald-500 to-teal-500" />
        <Kpi icon={AlertTriangle} label="Peor tiempo" value={`${worst} d`} hint="Mes más lento" gradient="bg-gradient-to-br from-amber-500 to-orange-500" />
        <Kpi icon={Activity} label="Tendencia EMA" value={`${trendPct >= 0 ? '+' : ''}${trendPct}%`} hint={trendPct <= 0 ? 'Mejora sostenida' : 'Empeoramiento'} trend={trendPct} gradient="bg-gradient-to-br from-violet-500 to-fuchsia-500" />
      </div>

      <div className="rounded-2xl border bg-card shadow-card p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-display font-semibold">Tiempo de respuesta por periodo</h3>
            <p className="text-xs text-muted-foreground">Barras: tiempo promedio · Línea: EMA (3 periodos)</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary" />Promedio</span>
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-accent" />EMA tendencia</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={420}>
          <ComposedChart data={data} margin={{ top: 16, right: 12, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.95} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} label={{ value: 'Días', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' } }} />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 10, boxShadow: '0 10px 30px -10px hsl(var(--primary) / 0.25)' }}
              formatter={(v: number, name: string) => [`${v} días`, name === 'promedio' ? 'Tiempo promedio' : name === 'ema' ? 'EMA tendencia' : name]}
              labelFormatter={(l) => `Periodo: ${l}`}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} formatter={(v) => v === 'promedio' ? 'Tiempo promedio' : 'EMA (tendencia)'} />
            <Bar name="promedio" dataKey="promedio" fill="url(#bg)" radius={[8, 8, 0, 0]} maxBarSize={48} />
            <Line name="ema" type="monotone" dataKey="ema" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--accent))', strokeWidth: 2, stroke: 'hsl(var(--background))' }} activeDot={{ r: 6 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default ResponseTimeReport;
