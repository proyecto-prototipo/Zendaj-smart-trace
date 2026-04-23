import { User, Role } from '@/app/types';

export const demoCredentials: Record<string, { password: string; role: Role; name: string }> = {
  'admin@zendaj.com': { password: '123456', role: 'administrador', name: 'Carlos Mendoza' },
  'postventa@zendaj.com': { password: '123456', role: 'asesor', name: 'María Fernández' },
  'tecnico@zendaj.com': { password: '123456', role: 'tecnico', name: 'Jorge Ramírez' },
  'cliente@zendaj.com': { password: '123456', role: 'cliente', name: 'Luis Vargas' },
  'gerencia@zendaj.com': { password: '123456', role: 'gerencia', name: 'Patricia Salinas' },
};

export const initialUsers: User[] = [
  { id: 'u1', name: 'Carlos Mendoza', email: 'admin@zendaj.com', document: '45678912', phone: '+51 987 654 321', role: 'administrador', type: 'interno', active: true, createdAt: '2026-04-15' },
  { id: 'u2', name: 'María Fernández', email: 'postventa@zendaj.com', document: '45123789', phone: '+51 987 111 222', role: 'asesor', type: 'interno', active: true, createdAt: '2025-04-10' },
  { id: 'u3', name: 'Jorge Ramírez', email: 'tecnico@zendaj.com', document: '40891234', phone: '+51 987 333 444', role: 'tecnico', type: 'interno', active: true, createdAt: '2026-04-20' },
  { id: 'u4', name: 'Patricia Salinas', email: 'gerencia@zendaj.com', document: '41234567', phone: '+51 987 555 666', role: 'gerencia', type: 'interno', active: true, createdAt: '2026-04-05' },
  { id: 'u5', name: 'Luis Vargas', email: 'cliente@zendaj.com', document: '72839102', phone: '+51 999 111 222', role: 'cliente', type: 'cliente', active: true, createdAt: '2026-04-12' },
  { id: 'u6', name: 'Ana Quispe', email: 'ana.quispe@gmail.com', document: '70123456', phone: '+51 998 444 333', role: 'cliente', type: 'cliente', active: true, createdAt: '2026-04-02' },
  { id: 'u7', name: 'Roberto Díaz', email: 'roberto.diaz@hotmail.com', document: '46789012', phone: '+51 977 222 111', role: 'cliente', type: 'cliente', active: true, createdAt: '2026-04-18' },
  { id: 'u8', name: 'Sofía Castillo', email: 'sofia.castillo@gmail.com', document: '48901234', phone: '+51 966 555 444', role: 'cliente', type: 'cliente', active: false, createdAt: '2026-04-05' },
  { id: 'u9', name: 'Diego Rojas', email: 'diego.rojas@yahoo.com', document: '43210987', phone: '+51 955 666 777', role: 'cliente', type: 'cliente', active: true, createdAt: '2026-04-20' },
  { id: 'u10', name: 'Karina Huamán', email: 'karina.huaman@gmail.com', document: '47654321', phone: '+51 944 888 999', role: 'cliente', type: 'cliente', active: true, createdAt: '2026-04-08' },
];
