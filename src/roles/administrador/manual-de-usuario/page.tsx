import { FileText, Download, Eye, ExternalLink, HelpCircle } from 'lucide-react';
import { Button } from '@/app/ui/button';
import { PageHeader } from '@/app/ui/page-header';

const ManualUsuarioPage = () => {
  // Links de visualización y descarga directa desde Google Drive
  const driveViewUrl = "https://drive.google.com/file/d/1vZZ4PVX1ZF9YU8gYhG6pUvUir5Q5abvM/preview";
  const driveDownloadUrl = "https://drive.google.com/uc?export=download&id=1vZZ4PVX1ZF9YU8gYhG6pUvUir5Q5abvM";
  const driveOriginalUrl = "https://drive.google.com/file/d/1vZZ4PVX1ZF9YU8gYhG6pUvUir5Q5abvM/view?usp=sharing";

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo con formato oficial del sistema */}
      <PageHeader 
        kicker="Soporte Técnico" 
        title="Manual de Usuario" 
        description="Consulta las guías de uso, flujos de trabajo y configuraciones del sistema ZENDAJ Smart Trace."
        actions={
          <a href={driveDownloadUrl} target="_blank" rel="noopener noreferrer">
            <Button className="bg-gradient-primary text-white shadow-md flex items-center gap-2">
              <Download className="h-4 w-4" />
              Descargar Manual (PDF)
            </Button>
          </a>
        }
      />

      {/* Panel de Accesos Rápidos e Información */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-xl border bg-card shadow-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm">Zendaj Smart Trace.pdf</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Documento Oficial</p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3 text-xs text-muted-foreground">
              <p>Este documento contiene instrucciones detalladas sobre:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Gestión y actualización de casos.</li>
                <li>Mapeo e historial de trazabilidad.</li>
                <li>Administración de roles y usuarios internos.</li>
                <li>Carga de evidencias y comprobantes.</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a href={driveOriginalUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2 text-xs">
                  <ExternalLink className="h-3 w-3" />
                  Abrir en Google Drive
                </Button>
              </a>
            </div>
          </div>

          {/* Tarjeta informativa de ayuda */}
          <div className="rounded-xl border bg-muted/30 p-5 flex gap-3 items-start">
            <HelpCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold">¿Necesitas soporte adicional?</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Si tras leer el manual sigues experimentando dudas con la persistencia en Supabase o los flujos del sistema, contacta al área de desarrollo.
              </p>
            </div>
          </div>
        </div>

        {/* Visor del PDF embebido interactivo */}
        <div className="md:col-span-2">
          <div className="rounded-xl border bg-card shadow-card overflow-hidden h-[650px] flex flex-col">
            <div className="p-4 border-b bg-muted/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium">Vista previa interactiva</span>
              </div>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">PDF</span>
            </div>
            
            <div className="flex-1 bg-muted/20 relative">
              <iframe 
                src={driveViewUrl} 
                title="Manual de Usuario Zendaj" 
                className="w-full h-full border-0 absolute inset-0"
                allow="autoplay"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualUsuarioPage;