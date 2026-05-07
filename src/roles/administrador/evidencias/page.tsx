import { useMemo, useRef, useState, useEffect } from 'react';
import { UploadCloud, FileImage, FileText, Trash2, Eye, MessageSquare, Download, ChevronLeft, ChevronRight } from 'lucide-react'; // AÑADIDO Chevron para flechas más intuitivas
import { useData } from '@/app/data/useData';
import { Evidence } from '@/app/types';
import { Button } from '@/app/ui/button';
import { Input } from '@/app/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/ui/dialog';
import { Label } from '@/app/ui/label';
import { Textarea } from '@/app/ui/textarea';
import { PageHeader } from '@/app/ui/page-header';
import { useAuth } from '@/app/auth/useAuth';
import { toast } from 'sonner';
import { formatBytes, formatDate } from '@/app/format/format';
import { cn } from '@/app/lib/utils';
import { supabase } from '@/lib/supabase'; 
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const typeIcon = { foto: FileImage, comprobante: FileText, documento: FileText, video: FileImage };
const typeColor = { foto: 'bg-info text-white', comprobante: 'bg-accent text-white', documento: 'bg-primary text-white', video: 'bg-warning text-white' } as const;

const EvidencesPage = () => {
  const { evidences, cases, addEvidence, removeEvidence, commentEvidence, fetchData } = useData();
  const session = useAuth(s => s.session)!;
   
  const [caseFilter, setCaseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Evidence | null>(null);
  const [carrusel, setCarrusel] = useState<{ list: any[], index: number, meta: Evidence } | null>(null);
  const [carruselIndex, setCarruselIndex] = useState(0);
  const [drag, setDrag] = useState(false);
  const [pending, setPending] = useState<File[]>([]);
  const [selCase, setSelCase] = useState('');
  const [selType, setSelType] = useState<'foto'|'documento o comprobante'|'video'>('foto');
  const [loading, setLoading] = useState(false);
  const [commentToEdit, setCommentToEdit] = useState<{ id: string; text: string } | null>(null);
  const [commentCarga, setCommentCarga] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIndices, setActiveIndices] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (carrusel?.list) {
      carrusel.list.forEach((file) => {
        const img = new Image();
        img.src = file.url;
      });
    }
  }, [carrusel]);

  const caseLabel = (id: string) => {
    const c = (cases ?? []).find(x => x.id === id);
    return c ? `${c.code} · ${c.client_name}` : '—';
  };

  const downloadAll = async (e: Evidence) => {
    if (!e.files || e.files.length === 0) {
      const link = document.createElement('a');
      link.href = e.url || '';
      link.download = e.name;
      link.click();
      return;
    }

    toast.loading("Preparando archivos...");
    const zip = new JSZip();
    
    for (const file of e.files) {
      const response = await fetch(file.url);
      const blob = await response.blob();
      zip.file(file.name, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${e.name.replace(/\s+/g, '_')}.zip`);
    toast.dismiss();
    toast.success("Descarga iniciada");
  };

  const filtered = useMemo(() => {
    return (evidences ?? []).filter((e: Evidence) => {
      if (caseFilter !== 'all' && e.caseId !== caseFilter) return false;
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;
      if (q && !e.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [evidences, caseFilter, typeFilter, q]);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    if (newFiles.length > 5) {
      toast.error("Solo puedes seleccionar un máximo de 5 archivos por carga.");
      return;
    }
    setPending(newFiles);
  };

  useEffect(() => {
    setCarruselIndex(0);
  }, [view]);

  const submit = async () => {
    if (!selCase) { 
      toast.error('Toda evidencia debe pertenecer a un caso'); 
      return; 
    }
    if (pending.length === 0) { toast.error('Selecciona al menos un archivo'); return; }
    
    setLoading(true);

    try {
      const uploadedFiles = [];
      for (const f of pending) {
        const fileName = `${Date.now()}_${f.name}`;
        await supabase.storage.from('evidencias').upload(fileName, f);
        const { data: { publicUrl } } = supabase.storage.from('evidencias').getPublicUrl(fileName);
        uploadedFiles.push({ name: f.name, url: publicUrl });
      }

      await addEvidence({ 
        caseId: selCase, 
        name: `Lote de ${pending.length} archivos`,
        type: selType, 
        size: pending.reduce((acc, f) => acc + f.size, 0), 
        uploadedBy: session.name,
        uploaded_at: new Date().toISOString(),
        comment: commentCarga,
        files: uploadedFiles
      });
      toast.success('Guardado correctamente');
      setPending([]); setOpen(false);
    } catch (err: any) { toast.error('Error: ' + err.message); } finally { setLoading(false); }
  };

  return (
    <>
      <PageHeader kicker="Módulo 4" title="Gestión de evidencias"
        description="Adjunta fotos, comprobantes y documentos. Toda evidencia debe pertenecer a un caso."
        actions={<Button onClick={() => setOpen(true)} className="bg-gradient-primary text-primary-foreground w-full sm:w-auto"><UploadCloud className="h-4 w-4 mr-2" />Cargar evidencia</Button>}
      />

      {/* FILTROS RESPONSIVOS */}
      <div className="rounded-xl border bg-card shadow-card mb-6 p-4 flex flex-col md:flex-row gap-3">
        <Input placeholder="Buscar archivo..." value={q} onChange={e => setQ(e.target.value)} className="w-full md:max-w-sm" />
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Select value={caseFilter} onValueChange={setCaseFilter}>
            <SelectTrigger className="w-full md:w-72"><SelectValue placeholder="Caso" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los casos</SelectItem>
              {(cases ?? []).map(c => (
                <SelectItem key={c.id} value={c.id}>{c.code} · {c.client_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="foto">Foto</SelectItem>
              <SelectItem value="comprobante">Comprobante</SelectItem>
              <SelectItem value="documento">Documento</SelectItem>
              <SelectItem value="video">Video</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.length === 0 && <div className="col-span-full text-center text-muted-foreground py-12 border rounded-xl bg-card">Sin evidencias para los filtros aplicados</div>}
        {filtered.map((e: Evidence) => { 
          const Icon = typeIcon[e.type];
          return (
            <div key={e.id} className="group rounded-xl border bg-card shadow-card overflow-hidden hover:shadow-elegant transition-all">
              <div className="aspect-video bg-gradient-to-br from-muted to-secondary flex items-center justify-center relative overflow-hidden">
                {e.files && e.files.length > 0 ? (
                  e.type === 'video' ? (
                    <video src={e.files[0].url} className="h-full w-full object-cover" muted />
                  ) : (e.files[0].name.toLowerCase().endsWith('.pdf') || e.files[0].name.toLowerCase().endsWith('.doc') || e.files[0].name.toLowerCase().endsWith('.docx')) ? (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-muted/50">
                      <FileText className="h-12 w-12 text-primary" />
                      <span className="text-[10px] font-bold mt-2 uppercase">{e.files[0].name.split('.').pop()}</span>
                    </div>
                  ) : (
                    <img src={e.files[0].url} alt={e.files[0].name} className="h-full w-full object-cover" />
                  )
                ) : e.url && e.type === 'foto' ? (
                  <img src={e.url} alt={e.name} className="h-full w-full object-cover" />
                ) : e.url && e.type === 'video' ? (
                  <video src={e.url} className="h-full w-full object-cover" muted />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Icon className="h-12 w-12 text-muted-foreground/60" />
                  </div>
                )}
                <span className={cn('absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider z-10', typeColor[e.type])}>
                  {e.type}
                </span>
              </div>

              <div className="p-3">
                <p className="font-medium text-sm truncate" title={e.name}>{e.name}</p>
                {(() => {
                  const caso = (cases ?? []).find(c => c.id === e.case_id);
                  return caso ? (
                    <p className="text-[11px] font-semibold text-primary mt-1 truncate bg-primary/10 px-2 py-1 rounded w-full">
                      {caso.code } · {caso.client_name}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">Sin caso asociado</p>
                  );
                })()}
                <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                  <span>{formatBytes(e.size)}</span>
                  <span>{formatDate(e.uploaded_at)}</span>
                </div>

                {e.comment && <p className="mt-2 text-xs italic text-muted-foreground border-l-2 border-primary/40 pl-2 line-clamp-2">"{e.comment}"</p>}
                <div className="flex gap-1 mt-3">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => setView(e)}><Eye className="h-3 w-3 mr-1" />Ver</Button>
                  <Button size="sm" variant="outline" onClick={() => setCommentToEdit({ id: e.id, text: e.comment || '' })}><MessageSquare className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => downloadAll(e)}><Download className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => { (removeEvidence as any)(e.id, e.files || []); toast.success('Evidencia eliminada'); }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL CARGA RESPONSIVO */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Cargar evidencia</DialogTitle>
            <DialogDescription className="text-xs">Toda evidencia debe pertenecer a un caso registrado.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 max-h-[70vh] overflow-y-auto px-1">
            <div className="space-y-1.5">
              <Label className="text-xs">Comentario inicial</Label>
              <Textarea value={commentCarga} onChange={(e) => setCommentCarga(e.target.value)} placeholder="Escribe un comentario..." className="text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Caso asociado *</Label>
                <Select value={selCase} onValueChange={setSelCase}>
                  <SelectTrigger className="text-sm"><SelectValue placeholder="Selecciona caso" /></SelectTrigger>
                  <SelectContent>{cases.map(c => <SelectItem key={c.id} value={c.id}>{c.code} · {c.client_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo de evidencia</Label>
                <Select value={selType} onValueChange={(v:any) => setSelType(v)}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="foto">Foto</SelectItem><SelectItem value="comprobante">Comprobante</SelectItem><SelectItem value="documento">Documento</SelectItem><SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                 onDragLeave={() => setDrag(false)}
                 onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
                 onClick={() => inputRef.current?.click()}
                 className={cn('rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition', drag ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/40')}>
              <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Seleccionar archivos</p>
              <p className="text-[10px] text-muted-foreground mt-1">Máx. 5 archivos.</p>
              <input ref={inputRef} type="file" multiple className="hidden" onChange={e => onFiles(e.target.files)} />
            </div>
            {pending.length > 0 && (
              <div className="space-y-1">
                {pending.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px] bg-muted/40 rounded p-2">
                    <span className="truncate flex-1 mr-2">{f.name}</span>
                    <span className="text-muted-foreground shrink-0">{formatBytes(f.size)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">Cancelar</Button>
            <Button onClick={submit} disabled={loading} className="bg-gradient-primary text-primary-foreground w-full sm:w-auto">
              {loading ? 'Subiendo...' : 'Cargar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VIEW MODAL RESPONSIVO */}
      <Dialog open={!!view} onOpenChange={() => setView(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl rounded-xl p-4 sm:p-6">
          {view && <>
            <DialogHeader>
              <DialogTitle className="font-display text-base sm:text-lg truncate">{view.name}</DialogTitle>
              <DialogDescription>
                {(() => {
                  const caso = (cases ?? []).find(c => c.id === view.case_id);
                  return caso ? (
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary ring-1 ring-inset ring-primary/20">
                      {caso.code} · {caso.client_name}
                    </span>
                  ) : "Sin caso";
                })()}
              </DialogDescription>
            </DialogHeader>

            <div className="relative aspect-video rounded-lg bg-muted flex items-center justify-center overflow-hidden my-2">
              {view.files && view.files.length > 0 ? (
                <>
                  {(() => {
                    const current = view.files[activeIndices[view.id] || 0];
                    const isDoc = current.name.toLowerCase().endsWith('.pdf');
                    return isDoc ? (
                      <iframe src={current.url} className="w-full h-full" />
                    ) : view.type === 'video' ? (
                      <video src={current.url} controls className="max-h-full w-full" />
                    ) : (
                      <img src={current.url} className="max-h-full w-full object-contain" />
                    );
                  })()}
                  {view.files.length > 1 && (
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 pointer-events-none">
                      <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-md pointer-events-auto" onClick={() => setActiveIndices(prev => ({...prev, [view.id]: Math.max(0, (prev[view.id] || 0) - 1)}))}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-md pointer-events-auto" onClick={() => setActiveIndices(prev => ({...prev, [view.id]: Math.min(view.files!.length - 1, (prev[view.id] || 0) + 1)}))}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                view.type === 'video' ? <video src={view.url} controls className="max-h-full w-full" /> : <img src={view.url} className="max-h-full w-full object-contain" />
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px] sm:text-xs">
              <div className="bg-muted/30 p-2 rounded-lg">
                <p className="text-muted-foreground">Tipo</p>
                <p className="font-semibold capitalize">{view.type}</p>
              </div>
              <div className="bg-muted/30 p-2 rounded-lg">
                <p className="text-muted-foreground">Tamaño</p>
                <p className="font-semibold">{formatBytes(view.size)}</p>
              </div>
              <div className="bg-muted/30 p-2 rounded-lg">
                <p className="text-muted-foreground">Subido</p>
                <p className="font-semibold">{view.uploaded_at ? formatDate(view.uploaded_at) : '—'}</p>
              </div>
            </div>
            {view.comment && <p className="text-xs italic border-l-2 border-primary pl-3 mt-2 text-muted-foreground">"{view.comment}"</p>}
          </>}
        </DialogContent>
      </Dialog>

      {/* COMMENT MODAL RESPONSIVO */}
      <Dialog open={!!commentToEdit} onOpenChange={() => setCommentToEdit(null)}>
        <DialogContent className="max-w-[90vw] sm:max-w-md rounded-xl">
          <DialogHeader><DialogTitle className="text-base">Comentar evidencia</DialogTitle></DialogHeader>
          <Textarea 
            rows={4} 
            value={commentToEdit?.text || ''} 
            onChange={e => setCommentToEdit(c => c ? { ...c, text: e.target.value } : c)} 
            placeholder="Escribe un comentario técnico..." 
            className="text-sm"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCommentToEdit(null)} className="w-full sm:w-auto">Cancelar</Button>
            <Button onClick={() => { 
              if (commentToEdit) { 
                commentEvidence(commentToEdit.id, commentToEdit.text); 
                toast.success('Comentario guardado'); 
                setCommentToEdit(null); 
              } 
            }} className="bg-gradient-primary text-primary-foreground w-full sm:w-auto">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EvidencesPage;