import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Case, CaseStatus, Evidence, FailureType, HistoryEntry, Sale, StatusConfig, User, WarrantyStatus } from '@/app/types';
import { initialUsers } from '@/app/mocks/mockUsers';
import { failureTypes, initialCases, initialEvidences, initialHistory, initialSales, statusConfigs } from '@/app/mocks/mockData';

interface DataStore {
  users: User[];
  sales: Sale[];
  cases: Case[];
  evidences: Evidence[];
  history: HistoryEntry[];
  failureTypes: FailureType[];
  statuses: StatusConfig[];

  // users
  addUser: (u: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, u: Partial<User>) => void;
  toggleUserActive: (id: string) => void;

  // sales
  addSale: (s: Omit<Sale, 'id'>) => void;
  updateSale: (id: string, s: Partial<Sale>) => void;

  // cases
  addCase: (c: Omit<Case, 'id' | 'code' | 'status' | 'warrantyStatus'>, actor: { name: string; role: any }) => Case;
  updateCaseStatus: (id: string, status: CaseStatus, actor: { name: string; role: any }, comment?: string) => void;
  updateWarranty: (id: string, warrantyStatus: WarrantyStatus, decision: string, checklist: { label: string; checked: boolean }[], actor: { name: string; role: any }) => void;
  closeCase: (id: string, finalResult: string, actor: { name: string; role: any }) => void;
  addCaseComment: (id: string, comment: string, actor: { name: string; role: any }) => void;

  // evidences
  addEvidence: (e: Omit<Evidence, 'id' | 'uploadedAt'>) => void;
  removeEvidence: (id: string) => void;
  commentEvidence: (id: string, comment: string) => void;

  // config
  addFailureType: (name: string, severity: 'baja'|'media'|'alta') => void;
  toggleFailureType: (id: string) => void;
  updateFailureType: (id: string, name: string, severity: 'baja'|'media'|'alta') => void;
  toggleStatus: (id: string) => void;

  reset: () => void;
}

const generateCaseCode = (cases: Case[]) => {
  const year = new Date().getFullYear();
  const num = (cases.length + 1).toString().padStart(4, '0');
  return `ZDJ-${year}-${num}`;
};

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

      addUser: (u) => set((s) => ({ users: [{ ...u, id: uid(), createdAt: now().slice(0, 10) }, ...s.users] })),
      updateUser: (id, u) => set((s) => ({ users: s.users.map(x => x.id === id ? { ...x, ...u } : x) })),
      toggleUserActive: (id) => set((s) => ({ users: s.users.map(x => x.id === id ? { ...x, active: !x.active } : x) })),

      addSale: (sale) => set((s) => ({ sales: [{ ...sale, id: uid() }, ...s.sales] })),
      updateSale: (id, sale) => set((s) => ({ sales: s.sales.map(x => x.id === id ? { ...x, ...sale } : x) })),

      addCase: (c, actor) => {
        const code = generateCaseCode(get().cases);
        const newCase: Case = { ...c, id: uid(), code, status: 'recibido', warrantyStatus: 'pendiente' };
        const entry: HistoryEntry = { id: uid(), caseId: newCase.id, date: now(), user: actor.name, role: actor.role, action: 'Caso creado', toStatus: 'recibido', comment: 'Reclamo registrado en el sistema' };
        set((s) => ({ cases: [newCase, ...s.cases], history: [entry, ...s.history] }));
        return newCase;
      },

      updateCaseStatus: (id, status, actor, comment) => {
        const current = get().cases.find(c => c.id === id);
        if (!current) return;
        const entry: HistoryEntry = { id: uid(), caseId: id, date: now(), user: actor.name, role: actor.role, action: `Cambio de estado a ${status}`, fromStatus: current.status, toStatus: status, comment };
        set((s) => ({
          cases: s.cases.map(c => c.id === id ? { ...c, status } : c),
          history: [entry, ...s.history],
        }));
      },

      updateWarranty: (id, warrantyStatus, decision, checklist, actor) => {
        const entry: HistoryEntry = { id: uid(), caseId: id, date: now(), user: actor.name, role: actor.role, action: `Validación de garantía: ${warrantyStatus}`, comment: decision };
        set((s) => ({
          cases: s.cases.map(c => c.id === id ? { ...c, warrantyStatus, technicalDecision: decision, warrantyChecklist: checklist, status: warrantyStatus === 'validado' ? 'validado' : warrantyStatus === 'rechazado' ? 'rechazado' : warrantyStatus === 'observado' ? 'observado' : 'en_revision' } : c),
          history: [entry, ...s.history],
        }));
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

      addCaseComment: (id, comment, actor) => {
        const entry: HistoryEntry = { id: uid(), caseId: id, date: now(), user: actor.name, role: actor.role, action: 'Comentario añadido', comment };
        set((s) => ({ history: [entry, ...s.history] }));
      },

      addEvidence: (e) => set((s) => ({ evidences: [{ ...e, id: uid(), uploadedAt: now().slice(0, 10) }, ...s.evidences] })),
      removeEvidence: (id) => set((s) => ({ evidences: s.evidences.filter(e => e.id !== id) })),
      commentEvidence: (id, comment) => set((s) => ({ evidences: s.evidences.map(e => e.id === id ? { ...e, comment } : e) })),

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
    { name: 'zendaj-data', version: 2 }
  )
);
