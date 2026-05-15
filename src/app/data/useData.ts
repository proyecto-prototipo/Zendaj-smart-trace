import { supabase } from '@/lib/supabase';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Case, CaseStatus, Evidence, FailureType, HistoryEntry, Sale, StatusConfig, User, WarrantyStatus } from '@/app/types';
import { initialUsers } from '@/app/mocks/mockUsers';
import { failureTypes, initialCases, initialEvidences, initialHistory, initialSales, statusConfigs } from '@/app/mocks/mockData';
import { toast } from 'sonner';

interface DataStore {
  users: User[];
  sales: Sale[];
  cases: Case[];
  evidences: Evidence[];
  history: HistoryEntry[];
  failureTypes: FailureType[];
  statuses: StatusConfig[];

  // users
  fetchData: () => Promise<void>;
  addUser: (u: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (id: string, u: Partial<User>) => Promise<void>;
  toggleUserActive: (id: string) => Promise<void>;

  // sales
  addSale: (s: Omit<Sale, 'id'>) => void;
  updateSale: (id: string, s: Partial<Sale>) => void;

  // cases
  // En tu interfaz DataStore:
  addCase: (c: Omit<Case, 'id'> , actor: { name: string; role: any }) => Promise<Case | null>;
  updateCaseStatus: (id: string, status: CaseStatus) => void;
  updateWarranty: (id: string, warrantyStatus: WarrantyStatus, decision: string, checklist: { label: string; checked: boolean }[], actor: { name: string; role: any }) => void;
  closeCase: (id: string, finalResult: string, actor: { name: string; role: any }) => void;
  addCaseComment: (id: string, comment: string, actor: { name: string; role: any }) => void;

  // evidences
  addEvidence: (e: Omit<Evidence, 'id' | 'uploadedAt'>) => void;
  removeEvidence: (id: string, files: any[]) => Promise<void>;
  commentEvidence: (id: string, comment: string) => void;

  // config
  addFailureType: (name: string, severity: 'baja'|'media'|'alta') => void;
  toggleFailureType: (id: string) => void;
  updateFailureType: (id: string, name: string, severity: 'baja'|'media'|'alta') => void;
  toggleStatus: (id: string) => void;

  reset: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

export const useData = create<DataStore>()(
  persist(
    (set, get) => ({
      users: initialUsers,
      sales: initialSales,
      cases: initialCases,
      evidences: initialEvidences,
      history: initialHistory,
      failureTypes,
      statuses: statusConfigs,

      fetchSales: async () => {
        const { data } = await supabase.from('sales').select('*');
        if (data) set({ sales: data });
      },

      fetchCases: async () => {
        const { data } = await supabase.from('cases').select('*');
        console.log("Datos cargados de Supabase:", data); // <--- MIRA LA CONSOLA
        if (data) set({ cases: data });
      },

      // PATRÓN DE ADD:
      addSale: async (s) => {
        // 1. Enviar a Supabase
        const dataToInsert = {
          product_code: s.product_code,
          product_name: s.product_name,
          category: s.category,
          brand: s.brand,
          model: s.model,
          purchase_date: s.purchase_date,
          invoice: s.invoice,
          client_id: s.client_id,
          client_name: s.client_name,
          vehicle: s.vehicle,
          amount: s.amount
        };
        console.log("Enviando a Supabase:", dataToInsert);

        const { data, error } = await supabase
          .from('sales')
          .insert([dataToInsert])
          .select()
          .single();

        if (error) {
          console.error("ERROR DETALLADO DE SUPABASE:", error); 
          toast.error(`Error: ${error.message} (Detalle: ${error.details})`);
          return;
        }
        // 3. Si no hay error, actualizar el estado local
        set((state) => ({ sales: [data, ...state.sales] }));
        toast.success("Registro guardado en la nube");
      },


      fetchData: async () => {
        // Función auxiliar para cargar tablas sin que una detenga a la otra
        const safeFetch = async (table: string) => {
          const { data, error } = await supabase.from(table).select('*');
          if (error) console.error(`Error cargando ${table}:`, error);
          return data ?? [];
        };

        const [users, sales, cases, evidences, dbHistory] = await Promise.all([
          safeFetch('users'),
          safeFetch('sales'),
          safeFetch('cases'),
          safeFetch('evidences'),
          safeFetch('case_history')
        ]);

        set({ users, sales, cases, evidences, history: [...initialHistory, ...dbHistory] });
      },

      addUser: async (u) => {
        const { data, error } = await supabase
          .from('users')
          .insert([{ ...u }])
          .select('*, createdAt:created_at') // Importante seleccionar el campo renombrado
          .single();

        if (error) { toast.error('Error al guardar'); return; }
        set((s) => ({ users: [data, ...s.users] }));
      },

      updateUser: async (id, u) => {
        const { error } = await supabase.from('users').update(u).eq('id', id);
        if (error) { toast.error('Error al actualizar'); return; }
        set((s) => ({ users: s.users.map(x => x.id === id ? { ...x, ...u } : x) }));
      },

      toggleUserActive: async (id) => {
        const user = get().users.find(u => u.id === id);
        if (!user) return;
        const newStatus = !user.active;
        await supabase.from('users').update({ active: newStatus }).eq('id', id);
        set((s) => ({ users: s.users.map(x => x.id === id ? { ...x, active: newStatus } : x) }));
      },

      updateSale: (id, sale) => set((s) => ({ sales: s.sales.map(x => x.id === id ? { ...x, ...sale } : x) })),

      addCase: async (c, actor) => {
        const code = `CAS-${Math.floor(1000 + Math.random() * 9000)}`;

        const caseToInsert = {
          code,
          client_id: c.client_id,
          client_name: c.client_name,
          sale_id: c.sale_id,
          product_name: c.product_name,
          failure_type: c.failure_type,
          description: c.description,
          observations: c.observations,
          invoice: c.invoice,
          mileage: c.mileage,
          priority: c.priority,
          created_by: actor.name
        };

        const { data, error } = await supabase
          .from('cases')
          .insert([caseToInsert])
          .select('*')
          .single();

        if (error) {
          console.error("Error Supabase:", error);
          return null;
        }

        set((s) => ({ cases: [data, ...s.cases] }));
        toast.success("Caso registrado con éxito");
        return data; 
      },


      updateCaseStatus: async (id, status) => {
        const currentCase = get().cases.find(c => c.id === id);
        const fromStatus = currentCase ? currentCase.status : null;

        const { error } = await supabase
          .from('cases')
          .update({ 
            status: status, 
          })
          .eq('id', id);

        if (error) {
          console.error("Error al actualizar estado:", error);
          toast.error("Error al actualizar en la base de datos");
          return;
        }

        const sessionData = JSON.parse(localStorage.getItem('zendaj-auth') || '{}');
        const actorName = sessionData?.state?.session?.name || 'Sistema';
        const actorRole = sessionData?.state?.session?.role || 'asesor';

        const { error: historyError } = await supabase
          .from('case_history')
          .insert([{
            case_id: id,
            action: 'Cambio de estado',
            user_name: actorName,
            user_role: actorRole,
            comment: `El caso cambió de estado de ${fromStatus ? fromStatus.replace('_',' ') : '—'} a ${status.replace('_',' ')}`,
            from_status: fromStatus,
            to_status: status
          }]);

        if (historyError) {
          console.error("Error al guardar en el historial:", historyError.message);
        }
        await get().fetchData();
      },

      addCaseComment: async (id, comment, actor, extra = {}) => {

        const { error } = await supabase
          .from('case_history') 
          .insert([{
            case_id: id,
            action: extra.action || 'Comentario añadido', // Usa la acción enviada o por defecto
            user_name: actor.name,
            user_role: actor.role,
            comment: comment,
            to_status: extra.toStatus || null // Guarda el nuevo estado si existe
          }]);

        if (error) {
          console.error("ERROR AL GUARDAR:", error.message);
          toast.error("Error de base de datos: " + error.message);
          return;
        }

        await get().fetchData(); 
      },

      updateWarranty: async (id, status, decision, checklist, user) => {
        console.log("Enviando a Supabase:", { status, decision, checklist }); // <--- MIRA ESTO
       let newStatus: CaseStatus = 'en_revision'; 
       if (status === 'validado') newStatus = 'validado';
       if (status === 'rechazado') newStatus = 'resuelto';

        const { error } = await supabase
          .from('cases')
          .update({

            warranty_status: status,  
            status: newStatus,      
            technicalDecision: decision,   
            warrantyChecklist: checklist,  
            warranty_updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select();

        if (error) {
          console.error("Error al actualizar:", error);
          toast.error("Error BD: " + error.message);
        } else {
          console.log("Guardado exitoso");
          
          await get().fetchData(); 
          toast.success("Cambios guardados");
        }
      },


      closeCase: (id, finalResult, actor) => {
        if (!finalResult.trim()) return;
        const current = get().cases.find(c => c.id === id);
        if (!current) return;
        const entry: HistoryEntry = { id: uid(), caseId: id, date: now(), user: actor.name, role: actor.role, action: 'Caso cerrado', fromStatus: current.status, toStatus: 'cerrado', comment: finalResult };
        set((s) => ({
          cases: s.cases.map(c => c.id === id ? { ...c, status: 'cerrado', finalResult, closedAt: now() } : c),
          history: [entry, ...s.history],
        }));
      },


      addEvidence: async (e) => {
        const dataToInsert = {
          case_id: e.caseId,
          name: e.name,
          type: e.type,
          size: e.size,
          uploaded_by: e.uploadedBy,
          uploaded_at: e.uploaded_at,
          comment: e.comment,
          files: e.files
        };

        console.log("Datos que estoy enviando a Supabase:", dataToInsert);

        const { data, error } = await supabase
          .from('evidences')
          .insert([dataToInsert])
          .select()
          .single();

        if (error) {
          console.error("--- ERROR CRÍTICO DE SUPABASE ---");
          console.error(error.message);
          console.error(error.details);
          console.error(error.hint);
          toast.error("Error BD: " + error.message);
          return;
        }

        console.log("Respuesta de Supabase:", data);
        set((s) => ({ evidences: [data, ...s.evidences] }));
      },

      removeEvidence: async (id: string, files: any[]) => {
        try {
          // 1. Borrado de archivos físicos
          if (files && files.length > 0) {
            const paths = files.map(f => f.url.split('/').pop());
            const { error: storageError } = await supabase.storage.from('evidencias').remove(paths);
            if (storageError) console.error("Error borrando archivos:", storageError);
          }

          // 2. Borrado de base de datos
          const { error: dbError } = await supabase
            .from('evidences')
            .delete()
            .eq('id', id);

          if (dbError) {
            throw new Error(`Error en DB: ${dbError.message}`);
          }

          // 3. Solo si NO hubo error en DB, actualizamos el estado
          set((s) => ({ evidences: s.evidences.filter(e => e.id !== id) }));
          
        } catch (err) {
          console.error("Fallo al eliminar:", err);
          toast.error("No se pudo eliminar de la base de datos. Revisa tus permisos RLS.");
        }
      },
      
      commentEvidence: async (id: string, comment: string) => {
        const { error } = await supabase
          .from('evidences')
          .update({ comment: comment }) 
          .eq('id', id);

        if (error) {
          console.error("Error al guardar comentario en Supabase:", error);
          toast.error("No se pudo guardar el comentario");
          return;
        }

        set((s) => ({ 
          evidences: s.evidences.map(e => e.id === id ? { ...e, comment } : e) 
        }));
      },

      addFailureType: (name, severity) => set((s) => ({ failureTypes: [{ id: uid(), name, severity, active: true }, ...s.failureTypes] })),
      toggleFailureType: (id) => set((s) => ({ failureTypes: s.failureTypes.map(f => f.id === id ? { ...f, active: !f.active } : f) })),
      updateFailureType: (id, name, severity) => set((s) => ({ failureTypes: s.failureTypes.map(f => f.id === id ? { ...f, name, severity } : f) })),
      toggleStatus: (id) => set((s) => ({ statuses: s.statuses.map(st => st.id === id ? { ...st, active: !st.active } : st) })),

      reset: () => set({
        users: initialUsers, sales: initialSales, cases: initialCases,
        evidences: initialEvidences, history: initialHistory,
        failureTypes, statuses: statusConfigs,
      }),
    }),
    { 
      name: 'zendaj-data', 
      version: 3,
      migrate: (persistedState: any, version: number) => {
        if (version < 3) return { ...persistedState, version: 3 };
        return persistedState;
      }
    }
  )
);
