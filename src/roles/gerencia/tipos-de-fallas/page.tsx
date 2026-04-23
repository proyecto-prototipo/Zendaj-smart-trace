import { useMemo, useState } from 'react';
import { useData } from '@/app/data/useData';
import { PageHeader } from '@/app/ui/page-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/ui/select';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, Sector } from 'recharts';
import { ListChecks } from 'lucide-react';

const COLORS = ['hsl(218 92% 52%)', 'hsl(174 80% 42%)', 'hsl(38 95% 55%)', 'hsl(0 84% 60%)', 'hsl(152 70% 42%)', 'hsl(280 70% 55%)', 'hsl(200 90% 50%)', 'hsl(15 88% 56%)'];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" className="fill-foreground font-display font-bold text-xl">{value}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" className="fill-muted-foreground text-xs">{(percent * 100).toFixed(1)}% · {payload.name}</text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

const FailuresDonutReport = () => {
  const { cases } = useData();
  const [period, setPeriod] = useState('all');
  const [statusF, setStatusF] = useState('all');
  const [active, setActive] = useState(0);

  const filtered = useMemo(() => cases.filter(c => {
    if (statusF !== 'all' && c.status !== statusF) return false;
    if (period !== 'all') {
      const days = parseInt(period);
      if (+new Date(c.date) < Date.now() - days * 86400000) return false;
    }
    return true;
  }), [cases, period, statusF]);

  const data = useMemo(() => {
    const m: Record<string, number> = {};
    filtered.forEach(c => m[c.failureType] = (m[c.failureType] || 0) + 1);
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <>
      <PageHeader
        kicker="Reporte ejecutivo"
        title="Tipos de falla"
        description="Distribución porcentual y absoluta de incidencias por tipo de falla. Pasa el cursor sobre cada segmento para ver el detalle."
        actions={
          <>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Periodo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo</SelectItem>
                <SelectItem value="30">Últimos 30 días</SelectItem>
                <SelectItem value="90">Últimos 90 días</SelectItem>
                <SelectItem value="180">Últimos 6 meses</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusF} onValueChange={setStatusF}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {['recibido','en_revision','observado','validado','resuelto','cerrado','rechazado'].map(s =>
                  <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
          </>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border bg-card shadow-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-semibold">Distribución por tipo de falla</h3>
            <span className="text-xs text-muted-foreground">{total} incidencias</span>
          </div>
          <ResponsiveContainer width="100%" height={420}>
            <PieChart>
              <Pie
                {...({ activeIndex: active, activeShape: renderActiveShape } as any)}
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={90}
                outerRadius={140}
                paddingAngle={2}
                onMouseEnter={(_, i) => setActive(i)}
              >
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="hsl(var(--background))" strokeWidth={2} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                formatter={(v: number, n: string) => [`${v} casos (${((v / total) * 100).toFixed(1)}%)`, n]}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border bg-card shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <ListChecks className="h-4 w-4 text-primary" />
            <h3 className="font-display font-semibold">Detalle por tipo</h3>
          </div>
          <div className="space-y-3">
            {data.map((d, i) => {
              const pct = total ? (d.value / total) * 100 : 0;
              return (
                <div
                  key={d.name}
                  onMouseEnter={() => setActive(i)}
                  className={`rounded-lg border p-3 cursor-pointer transition ${active === i ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <p className="text-sm font-medium truncate">{d.name}</p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{d.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 tabular-nums">{pct.toFixed(1)}% del total</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default FailuresDonutReport;
