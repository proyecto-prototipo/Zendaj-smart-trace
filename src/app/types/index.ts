export type Role = 'administrador' | 'asesor' | 'tecnico' | 'cliente' | 'gerencia';

export interface User {
  id: string;
  name: string;
  email: string;
  document: string;
  phone: string;
  role: Role;
  type: 'interno' | 'cliente';
  active: boolean;
  createdAt: string;
}

export interface Vehicle {
  plate: string;
  brand: string;
  model: string;
  year: number;
}

export interface Sale {
  id: string;
  productCode: string;
  productName: string;
  category: string;
  brand: string;
  model: string;
  purchaseDate: string;
  invoice: string;
  clientId: string;
  clientName: string;
  vehicle: Vehicle;
  amount: number;
}

export type CaseStatus = 'recibido' | 'en_revision' | 'observado' | 'validado' | 'resuelto' | 'cerrado' | 'rechazado';
export type Priority = 'baja' | 'media' | 'alta' | 'critica';
export type WarrantyStatus = 'pendiente' | 'en_revision' | 'observado' | 'validado' | 'rechazado';

export interface Evidence {
  id: string;
  caseId: string;
  name: string;
  type: 'foto' | 'comprobante' | 'documento' | 'video';
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  url?: string;
  comment?: string;
}

export interface HistoryEntry {
  id: string;
  caseId: string;
  date: string;
  user: string;
  role: Role;
  action: string;
  fromStatus?: CaseStatus;
  toStatus?: CaseStatus;
  comment?: string;
}

export interface Case {
  id: string;
  code: string;
  date: string;
  clientId: string;
  clientName: string;
  saleId: string;
  productName: string;
  failureType: string;
  description: string;
  observations: string;
  invoice: string;
  mileage: number;
  priority: Priority;
  status: CaseStatus;
  warrantyStatus: WarrantyStatus;
  warrantyChecklist?: { label: string; checked: boolean }[];
  technicalDecision?: string;
  finalResult?: string;
  assignedTo?: string;
  createdBy: string;
  closedAt?: string;
}

export interface FailureType { id: string; name: string; severity: 'baja'|'media'|'alta'; active: boolean; }
export interface StatusConfig { id: string; key: CaseStatus; label: string; color: string; active: boolean; }
