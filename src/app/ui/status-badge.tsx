import { cn } from '@/app/lib/utils';
import { CaseStatus, Priority, WarrantyStatus } from '@/app/types';
import { priorityMeta, statusMeta, warrantyMeta } from '@/app/format/format';

const warrantyConfigs = {
  pendiente: { label: 'Pendiente', classes: 'bg-yellow-100 text-yellow-800' },
  en_revision: { label: 'En Revisión', classes: 'bg-blue-100 text-blue-800' },
  observado: { label: 'Observado', classes: 'bg-orange-100 text-orange-800' },
  validado: { label: 'Validado', classes: 'bg-green-100 text-green-800' },
  rechazado: { label: 'Rechazado', classes: 'bg-red-100 text-red-800' }
};

export const StatusBadge = ({ status }: { status: CaseStatus }) => {
  const m = statusMeta[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium', m.classes)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', m.dot)} />
      {m.label}
    </span>
  );
};

export const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const m = priorityMeta[priority];
  return (
    <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide', m.classes)}>
      {m.label}
    </span>
  );
};

export const WarrantyBadge = ({ status }: { status: string | undefined }) => {
  const safeStatus = status || 'pendiente';
  
  const config = warrantyConfigs[safeStatus as keyof typeof warrantyConfigs] || { 
    label: 'Desconocido', 
    classes: 'bg-gray-100 text-gray-800' 
  };

  return (
    <span className={cn("px-2 py-1 rounded text-xs font-medium", config.classes)}>
      {config.label}
    </span>
  );
};
