import { useMemo, useRef, useState } from 'react';
import { UploadCloud, FileImage, FileText, Trash2, Eye, MessageSquare, Download } from 'lucide-react';
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

const typeIcon = { foto: FileImage, comprobante: FileText, documento: FileText, video: FileImage };
const typeColor = { foto: 'bg-info/10 text-info', comprobante: 'bg-accent/10 text-accent', documento: 'bg-primary/10 text-primary', video: 'bg-warning/10 text-warning' } as const;

const EvidencesPage = () => {
  const { evidences, cases, addEvidence, removeEvidence, commentEvidence } = useData();
  const session = useAuth(s => s.session)!;
  const [caseFilter, setCaseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Evidence | null>(null);
  const [comment, setComment] = useState<{ id: string; text: string } | null>(null);
  const [drag, setDrag] = useState(false);
  const [pending, setPending] = useState<File[]>([]);
  const [selCase, setSelCase] = useState('');
  const [selType, setSelType] = useState<'foto'|'comprobante'|'documento'|'video'>('foto');
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => evidences.filter(e => {
    if (caseFilter !== 'all' && e.caseId !== caseFilter) return false;
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (q && !e.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [evidences, caseFilter, typeFilter, q]);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    setPending(Array.from(files));
  };

  const submit = () => {
    if (!selCase) { toast.error('Toda evidencia debe pertenecer a un caso'); return; }
    if (pending.length === 0) { toast.error('Selecciona al menos un archivo'); return; }
    pending.forEach(f => {
      const url = f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined;
      addEvidence({ caseId: selCase, name: f.name, type: selType, size: f.size, uploadedBy: session.name, url });
    });
    toast.success(`${pending.length} evidencia(s) cargada(s)`);
    setPending([]); setSelCase(''); setOpen(false);
  };

  const caseLabel = (id: string) => {
    const c = cases.find(x => x.id === id);
    return c ? `${c.code} · ${c.clientName}` : '—';
  };

  return (
    <>
      <PageHeader kicker="Módulo 4" title="Gestión de evidencias"
        description="Adjunta fotos, comprobantes y documentos. Toda evidencia debe pertenecer a un caso."
        actions={<Button onClick={() => setOpen(true)} className="bg-gradient-primary text-primary-foreground"><UploadCloud className="h-4 w-4 mr-2" />Cargar evidencia</Button>}
      />

      <div className="rounded-xl border bg-card shadow-card mb-6 p-4 flex flex-col sm:flex-row gap-3">
        <Input placeholder="Buscar archivo..." value={q} onChange={e => setQ(e.target.value)} className="max-w-sm" />
        <Select value={caseFilter} onValueChange={setCaseFilter}>
          <SelectTrigger className="w-72"><SelectValue placeholder="Caso" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los casos</SelectItem>
            {cases.map(c => <SelectItem key={c.id} value={c.id}>{c.code} · {c.clientName}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="foto">Foto</SelectItem><SelectItem value="comprobante">Comprobante</SelectItem><SelectItem value="documento">Documento</SelectItem><SelectItem value="video">Video</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.length === 0 && <div className="col-span-full text-center text-muted-foreground py-12 border rounded-xl bg-card">Sin evidencias para los filtros aplicados</div>}
        {filtered.map(e => {
          const Icon = typeIcon[e.type];
          return (
            <div key={e.id} className="group rounded-xl border bg-card shadow-card overflow-hidden hover:shadow-elegant transition-all">
              <div className="aspect-video bg-gradient-to-br from-muted to-secondary flex items-center justify-center relative">
                {e.url
                  ? <img src={e.url} alt={e.name} className="h-full w-full object-cover" />
                  : <Icon className="h-12 w-12 text-muted-foreground/40" />}
                <span className={cn('absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider', typeColor[e.type])}>{e.type}</span>
              </div>
              <div className="p-3">
                <p className="font-medium text-sm truncate" title={e.name}>{e.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{caseLabel(e.caseId)}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{formatBytes(e.size)}</span>
                  <span>{formatDate(e.uploadedAt)}</span>
                </div>
                {e.comment && <p className="mt-2 text-xs italic text-muted-foreground border-l-2 border-primary/40 pl-2 line-clamp-2">"{e.comment}"</p>}
                <div className="flex gap-1 mt-3">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setView(e)}><Eye className="h-3 w-3 mr-1" />Ver</Button>
                  <Button size="sm" variant="outline" onClick={() => setComment({ id: e.id, text: e.comment || '' })}><MessageSquare className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success('Descarga simulada iniciada')}><Download className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => { removeEvidence(e.id); toast.success('Evidencia eliminada'); }}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Cargar evidencia</DialogTitle>
            <DialogDescription>Toda evidencia debe pertenecer a un caso registrado.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Caso asociado *</Label>
              <Select value={selCase} onValueChange={setSelCase}>
                <SelectTrigger><SelectValue placeholder="Selecciona caso" /></SelectTrigger>
                <SelectContent>{cases.map(c => <SelectItem key={c.id} value={c.id}>{c.code} · {c.clientName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de evidencia</Label>
              <Select value={selType} onValueChange={(v:any) => setSelType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="foto">Foto</SelectItem><SelectItem value="comprobante">Comprobante</SelectItem><SelectItem value="documento">Documento</SelectItem><SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                 onDragLeave={() => setDrag(false)}
                 onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
                 onClick={() => inputRef.current?.click()}
                 className={cn('rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition', drag ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/40')}>
              <UploadCloud className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Arrastra archivos aquí o <span className="text-primary">selecciónalos</span></p>
              <p className="text-xs text-muted-foreground mt-1">Imágenes, PDFs, documentos</p>
              <input ref={inputRef} type="file" multiple className="hidden" onChange={e => onFiles(e.target.files)} />
            </div>
            {pending.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">{pending.length} archivo(s) listo(s):</p>
                {pending.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-muted/40 rounded p-2">
                    <span className="truncate">{f.name}</span>
                    <span className="text-muted-foreground">{formatBytes(f.size)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit} className="bg-gradient-primary text-primary-foreground">Cargar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View */}
      <Dialog open={!!view} onOpenChange={() => setView(null)}>
        <DialogContent className="sm:max-w-2xl">
          {view && <>
            <DialogHeader><DialogTitle className="font-display">{view.name}</DialogTitle><DialogDescription>{caseLabel(view.caseId)}</DialogDescription></DialogHeader>
            <div className="aspect-video rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              {view.url ? <img src={view.url} alt={view.name} className="max-h-full" /> : <FileText className="h-20 w-20 text-muted-foreground/40" />}
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div><p className="text-xs text-muted-foreground">Tipo</p><p className="font-medium capitalize">{view.type}</p></div>
              <div><p className="text-xs text-muted-foreground">Tamaño</p><p className="font-medium">{formatBytes(view.size)}</p></div>
              <div><p className="text-xs text-muted-foreground">Subido</p><p className="font-medium">{formatDate(view.uploadedAt)}</p></div>
            </div>
            {view.comment && <p className="text-sm italic border-l-2 border-primary pl-3">"{view.comment}"</p>}
          </>}
        </DialogContent>
      </Dialog>

      {/* Comment */}
      <Dialog open={!!comment} onOpenChange={() => setComment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Comentar evidencia</DialogTitle></DialogHeader>
          <Textarea rows={4} value={comment?.text || ''} onChange={e => setComment(c => c ? { ...c, text: e.target.value } : c)} placeholder="Escribe un comentario técnico..." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setComment(null)}>Cancelar</Button>
            <Button onClick={() => { if (comment) { commentEvidence(comment.id, comment.text); toast.success('Comentario guardado'); setComment(null); } }} className="bg-gradient-primary text-primary-foreground">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EvidencesPage;
