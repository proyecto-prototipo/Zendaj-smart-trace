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
  product_code: string;
  product_name: string;
  category: string;
  brand: string;
  model: string;
  purchase_date: string;
  invoice: string;
  client_id: string;
  client_name: string;
  vehicle: string;
  amount: number;
}

export type CaseStatus = 'recibido' | 'en_revision' | 'observado' | 'validado' | 'resuelto' | 'cerrado' | 'rechazado';
export type Priority = 'baja' | 'media' | 'alta' | 'critica';
export type WarrantyStatus = 'pendiente' | 'en_revision' | 'observado' | 'validado' | 'rechazado';

export interface Evidence {
  id: string;
  case_id: string;
  name: string;
  type: 'foto' | 'comprobante' | 'documento' | 'video';
  size: number;
  uploaded_at: string;
  uploadedBy: string;
  comment?: string;
  url?: string; 
  files?: { name: string; url: string }[];
}

export interface HistoryEntry {
  id: string;
  case_id: string;
  date: string;
  user: string;
  role: any;
  action: string;
  comment?: string;
  user_name?: string;  
  user_role?: string;  
  to_status?: string;  
  created_at?: string; 
}

export interface Case {
  id: string;
  code: string;
  client_id: string;
  client_name: string;
  sale_id: string;
  product_name: string;
  failure_type: string;
  description: string;
  observations: string;
  invoice: string;
  mileage: number;
  priority: Priority;
  warranty_status: string;
  warrantyStatus?: WarrantyStatus;
  technicalDecision?: string;
  warrantyChecklist?: any[];
}

export interface FailureType { id: string; name: string; severity: 'baja'|'media'|'alta'; active: boolean; }
export interface StatusConfig { id: string; key: CaseStatus; label: string; color: string; active: boolean; }
