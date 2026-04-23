import { Outlet, useLocation, useNavigate, NavLink as RouterNavLink, Link } from 'react-router-dom';
import { Activity, LogOut, Search, Bell, ChevronRight } from 'lucide-react';
import { useAuth, roleLabels } from '@/app/auth/useAuth';
import { navByRole } from '@/app/layout/navConfig';
import { Button } from '@/app/ui/button';
import { Avatar, AvatarFallback } from '@/app/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/app/ui/dropdown-menu';
import { cn } from '@/app/lib/utils';
import { toast } from 'sonner';

export const AppLayout = () => {
  const session = useAuth(s => s.session);
  const logout = useAuth(s => s.logout);
  const nav = useNavigate();
  const loc = useLocation();
  if (!session) return null;
  const items = navByRole[session.role];
  const grouped = items.reduce<Record<string, typeof items>>((acc, it) => {
    const g = it.group || 'Menú';
    (acc[g] ||= []).push(it);
    return acc;
  }, {});

  const initials = session.name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  const current = items.find(i => loc.pathname.startsWith(i.to));

  const onLogout = () => { logout(); toast.success('Sesión cerrada'); nav('/login', { replace: true }); };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <Link to="/app/dashboard" className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent shadow-glow shrink-0">
            <Activity className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="leading-tight">
            <p className="font-display text-sm font-bold text-white">ZENDAJ</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/60">Smart-Trace</p>
          </div>
        </Link>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {Object.entries(grouped).map(([group, list]) => (
            <div key={group}>
              <p className="px-3 mb-1 text-[10px] uppercase tracking-widest font-semibold text-sidebar-foreground/40">{group}</p>
              <div className="space-y-0.5">
                {list.map(it => (
                  <RouterNavLink key={it.to} to={it.to}
                    className={({ isActive }) => cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-white font-medium shadow-inner'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white'
                    )}>
                    {({ isActive }) => (
                      <>
                        <it.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-accent' : 'text-sidebar-foreground/60 group-hover:text-white')} />
                        <span className="truncate">{it.label}</span>
                        {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}
                      </>
                    )}
                  </RouterNavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="rounded-lg bg-sidebar-accent/40 p-3">
            <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50 font-semibold">Sesión activa</p>
            <p className="mt-1 text-sm font-semibold text-white truncate">{session.name}</p>
            <p className="text-xs text-sidebar-foreground/60">{roleLabels[session.role]}</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center gap-4 px-4 lg:px-8 border-b bg-card/80 backdrop-blur sticky top-0 z-30">
          <div className="lg:hidden flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0"><Activity className="h-4 w-4 text-primary-foreground" /></div>
            <span className="font-display font-bold">ZENDAJ</span>
          </div>
          <div className="hidden md:flex items-center text-sm text-muted-foreground">
            <Link to="/app/dashboard" className="hover:text-foreground">Inicio</Link>
            {current && <><ChevronRight className="h-4 w-4 mx-1" /><span className="text-foreground font-medium">{current.label}</span></>}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input placeholder="Buscar caso, cliente, producto..." className="h-9 w-72 rounded-lg border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-destructive" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full hover:bg-secondary px-2 py-1 transition">
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold leading-tight">{session.name}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{roleLabels[session.role]}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="font-semibold">{session.name}</p>
                  <p className="text-xs text-muted-foreground font-normal">{session.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
