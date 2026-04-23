import { Role } from '@/app/types';
import { LayoutDashboard, Users, ShoppingBag, AlertTriangle, FileImage, ShieldCheck, GitBranch, Settings, BarChart3, FolderOpen, ListChecks, ClipboardList, History, FilePlus2, Home, PieChart, TrendingUp, Sparkles } from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: any;
  group?: string;
}

export const navByRole: Record<Role, NavItem[]> = {
  administrador: [
    { label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard, group: 'General' },
    { label: 'Usuarios y clientes', to: '/app/usuarios', icon: Users, group: 'Gestión' },
    { label: 'Productos y ventas', to: '/app/productos', icon: ShoppingBag, group: 'Gestión' },
    { label: 'Incidencias', to: '/app/incidencias', icon: AlertTriangle, group: 'Operación' },
    { label: 'Evidencias', to: '/app/evidencias', icon: FileImage, group: 'Operación' },
    { label: 'Validación de garantía', to: '/app/garantias', icon: ShieldCheck, group: 'Operación' },
    { label: 'Trazabilidad', to: '/app/trazabilidad', icon: GitBranch, group: 'Operación' },
    { label: 'Administración', to: '/app/administracion', icon: Settings, group: 'Sistema' },
  ],
  asesor: [
    { label: 'Dashboard operativo', to: '/app/dashboard', icon: LayoutDashboard, group: 'General' },
    { label: 'Clientes', to: '/app/usuarios', icon: Users, group: 'Atención' },
    { label: 'Ventas asociadas', to: '/app/productos', icon: ShoppingBag, group: 'Atención' },
    { label: 'Incidencias', to: '/app/incidencias', icon: AlertTriangle, group: 'Casos' },
    { label: 'Evidencias', to: '/app/evidencias', icon: FileImage, group: 'Casos' },
    { label: 'Seguimiento', to: '/app/trazabilidad', icon: GitBranch, group: 'Casos' },
  ],
  tecnico: [
    { label: 'Dashboard técnico', to: '/app/dashboard', icon: LayoutDashboard, group: 'General' },
    { label: 'Revisión de casos', to: '/app/incidencias', icon: ClipboardList, group: 'Evaluación' },
    { label: 'Validación de garantía', to: '/app/garantias', icon: ShieldCheck, group: 'Evaluación' },
    { label: 'Evidencias', to: '/app/evidencias', icon: FileImage, group: 'Evaluación' },
    { label: 'Historial', to: '/app/trazabilidad', icon: History, group: 'Consulta' },
  ],
  cliente: [
    { label: 'Mi panel', to: '/app/cliente', icon: Home, group: 'Mi cuenta' },
    { label: 'Registrar incidencia', to: '/app/cliente/nuevo', icon: FilePlus2, group: 'Mi cuenta' },
    { label: 'Mis reclamos', to: '/app/cliente/reclamos', icon: FolderOpen, group: 'Mi cuenta' },
    { label: 'Estado y seguimiento', to: '/app/cliente/reclamos', icon: GitBranch, group: 'Seguimiento' },
  ],
  gerencia: [
    { label: 'Dashboard ejecutivo', to: '/app/dashboard', icon: LayoutDashboard, group: 'Indicadores' },
    { label: 'Tipos de fallas', to: '/app/reportes/fallas', icon: PieChart, group: 'Reportes' },
    { label: 'Tiempo de respuesta', to: '/app/reportes/tiempos', icon: TrendingUp, group: 'Reportes' },
    { label: 'Volumen de incidencias', to: '/app/incidencias', icon: BarChart3, group: 'Reportes' },
    { label: 'Oportunidades de mejora', to: '/app/dashboard', icon: Sparkles, group: 'Análisis' },
  ],
};
