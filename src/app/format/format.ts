import { CaseStatus, Priority, WarrantyStatus } from '@/app/types';

export const statusMeta: Record<CaseStatus, { label: string; classes: string; dot: string }> = {
  recibido:    { label: 'Recibido',     classes: 'bg-info/10 text-info border-info/30',         dot: 'bg-info' },
  en_revision: { label: 'En revisión',  classes: 'bg-warning/10 text-warning border-warning/30',dot: 'bg-warning' },
  observado:   { label: 'Observado',    classes: 'bg-amber-500/10 text-amber-600 border-amber-500/30', dot: 'bg-amber-500' },
  validado:    { label: 'Validado',     classes: 'bg-success/10 text-success border-success/30',dot: 'bg-success' },
  resuelto:    { label: 'Resuelto',     classes: 'bg-success/15 text-success border-success/40',dot: 'bg-success' },
  cerrado:     { label: 'Cerrado',      classes: 'bg-muted text-muted-foreground border-border',dot: 'bg-muted-foreground' },
  rechazado:   { label: 'Rechazado',    classes: 'bg-destructive/10 text-destructive border-destructive/30', dot: 'bg-destructive' },
};

export const priorityMeta: Record<Priority, { label: string; classes: string }> = {
  baja:    { label: 'Baja',     classes: 'bg-muted text-muted-foreground border-border' },
  media:   { label: 'Media',    classes: 'bg-info/10 text-info border-info/30' },
  alta:    { label: 'Alta',     classes: 'bg-warning/10 text-warning border-warning/30' },
  critica: { label: 'Crítica',  classes: 'bg-destructive/10 text-destructive border-destructive/30' },
};

export const warrantyMeta: Record<WarrantyStatus, { label: string; classes: string }> = {
  pendiente:   { label: 'Pendiente',    classes: 'bg-muted text-muted-foreground border-border' },
  en_revision: { label: 'En revisión',  classes: 'bg-warning/10 text-warning border-warning/30' },
  observado:   { label: 'Observado',    classes: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  validado:    { label: 'Validado',     classes: 'bg-success/10 text-success border-success/30' },
  rechazado:   { label: 'Rechazado',    classes: 'bg-destructive/10 text-destructive border-destructive/30' },
};

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1024/1024).toFixed(2)} MB`;
};
