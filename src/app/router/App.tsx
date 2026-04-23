import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/app/ui/sonner";
import { Toaster } from "@/app/ui/toaster";
import { TooltipProvider } from "@/app/ui/tooltip";
import Index from "@/app/router/Index";
import NotFound from "@/app/router/NotFound";
import LoginPage from "@/auth/login/LoginPage";
import { ProtectedRoute } from "@/app/auth/ProtectedRoute";
import { AppLayout } from "@/app/layout/AppLayout";
import { useAuth } from "@/app/auth/useAuth";

// Roles → módulos (cada módulo tiene su propio page.tsx dentro)
import AdminDashboard from "@/roles/administrador/dashboard";
import AdminUsuarios from "@/roles/administrador/usuarios";
import AdminProductos from "@/roles/administrador/productos-ventas";
import AdminIncidencias from "@/roles/administrador/incidencias";
import AdminEvidencias from "@/roles/administrador/evidencias";
import AdminGarantias from "@/roles/administrador/validacion-garantia";
import AdminTrazabilidad from "@/roles/administrador/trazabilidad";
import AdminConfig from "@/roles/administrador/administracion";

import ClienteHome from "@/roles/cliente/dashboard";
import ClienteNuevo from "@/roles/cliente/registrar-incidencia";
import ClienteReclamos from "@/roles/cliente/mis-reclamos";
import ClienteDetalle from "@/roles/cliente/detalle-caso";

import GerenciaDashboard from "@/roles/gerencia/dashboard";
import GerenciaFallas from "@/roles/gerencia/tipos-de-fallas";
import GerenciaTiempos from "@/roles/gerencia/tiempo-de-respuesta";

const queryClient = new QueryClient();

const RoleDashboard = () => {
  const role = useAuth(s => s.session?.role);
  if (role === 'gerencia') return <GerenciaDashboard />;
  return <AdminDashboard />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<RoleDashboard />} />
            <Route path="usuarios" element={<AdminUsuarios />} />
            <Route path="productos" element={<AdminProductos />} />
            <Route path="incidencias" element={<AdminIncidencias />} />
            <Route path="evidencias" element={<AdminEvidencias />} />
            <Route path="garantias" element={<AdminGarantias />} />
            <Route path="garantias/:id" element={<AdminGarantias />} />
            <Route path="trazabilidad" element={<AdminTrazabilidad />} />
            <Route path="trazabilidad/:id" element={<AdminTrazabilidad />} />
            <Route path="administracion" element={<AdminConfig />} />

            {/* Cliente */}
            <Route path="cliente" element={<ClienteHome />} />
            <Route path="cliente/nuevo" element={<ClienteNuevo />} />
            <Route path="cliente/reclamos" element={<ClienteReclamos />} />
            <Route path="cliente/caso/:id" element={<ClienteDetalle />} />
            <Route path="mi-caso" element={<Navigate to="/app/cliente" replace />} />
            <Route path="mi-historial" element={<Navigate to="/app/cliente/reclamos" replace />} />

            {/* Gerencia */}
            <Route path="reportes/fallas" element={<GerenciaFallas />} />
            <Route path="reportes/tiempos" element={<GerenciaTiempos />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
