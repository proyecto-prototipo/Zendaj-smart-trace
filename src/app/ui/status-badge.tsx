import { cn } from '@/app/lib/utils';
import { CaseStatus, Priority, WarrantyStatus } from '@/app/types';
import { priorityMeta, statusMeta, warrantyMeta } from '@/app/format/format';

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

export const WarrantyBadge = ({ status }: { status: WarrantyStatus }) => {
  const m = warrantyMeta[status];
  return (
    <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium', m.classes)}>
      {m.label}
    </span>
  );
};
