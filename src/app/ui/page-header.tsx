import { ReactNode } from 'react';

export const PageHeader = ({ title, description, actions, kicker }: { title: string; description?: string; actions?: ReactNode; kicker?: string }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
    <div>
      {kicker && <p className="text-xs uppercase tracking-widest font-semibold text-primary mb-1">{kicker}</p>}
      <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">{title}</h1>
      {description && <p className="text-muted-foreground mt-1 max-w-2xl">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);
