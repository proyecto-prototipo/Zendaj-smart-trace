import { Sale, Case, Evidence, HistoryEntry, FailureType, StatusConfig } from '@/app/types';

export const failureTypes: FailureType[] = [
  { id: 'f1', name: 'Falla prematura', severity: 'media', active: true },
  { id: 'f2', name: 'Defecto de fabricación', severity: 'alta', active: true },
  { id: 'f3', name: 'Instalación incorrecta', severity: 'media', active: true },
  { id: 'f4', name: 'Daño por uso', severity: 'baja', active: true },
  { id: 'f5', name: 'Incompatibilidad', severity: 'media', active: true },
  { id: 'f6', name: 'Desgaste anormal', severity: 'media', active: true },
  { id: 'f7', name: 'Fallo eléctrico', severity: 'alta', active: true },
  { id: 'f8', name: 'Pérdida de fluido', severity: 'alta', active: true },
];

export const statusConfigs: StatusConfig[] = [
  { id: 's1', key: 'recibido', label: 'Recibido', color: 'info', active: true },
  { id: 's2', key: 'en_revision', label: 'En revisión', color: 'warning', active: true },
  { id: 's3', key: 'observado', label: 'Observado', color: 'warning', active: true },
  { id: 's4', key: 'validado', label: 'Validado', color: 'success', active: true },
  { id: 's5', key: 'resuelto', label: 'Resuelto', color: 'success', active: true },
  { id: 's6', key: 'cerrado', label: 'Cerrado', color: 'muted', active: true },
  { id: 's7', key: 'rechazado', label: 'Rechazado', color: 'destructive', active: true },
];

export const initialSales: Sale[] = [
  { id: 'v1', productCode: 'AP-BR-1024', productName: 'Pastillas de freno cerámicas', category: 'Frenos', brand: 'Bosch', model: 'BP-450', purchaseDate: '2026-04-15', invoice: 'F001-00234', clientId: 'u5', clientName: 'Luis Vargas', vehicle: { plate: 'AGT-128', brand: 'Toyota', model: 'Corolla', year: 2019 }, amount: 320 },
  { id: 'v2', productCode: 'AP-AM-2034', productName: 'Amortiguador delantero', category: 'Suspensión', brand: 'Monroe', model: 'OE-Spectrum', purchaseDate: '2026-04-02', invoice: 'F001-00298', clientId: 'u6', clientName: 'Ana Quispe', vehicle: { plate: 'BCD-456', brand: 'Hyundai', model: 'Accent', year: 2020 }, amount: 580 },
  { id: 'v3', productCode: 'AP-FT-3041', productName: 'Filtro de aceite premium', category: 'Filtros', brand: 'Mann-Filter', model: 'W712/75', purchaseDate: '2026-04-20', invoice: 'F001-00345', clientId: 'u7', clientName: 'Roberto Díaz', vehicle: { plate: 'EFG-789', brand: 'Kia', model: 'Rio', year: 2021 }, amount: 75 },
  { id: 'v4', productCode: 'AP-BT-4012', productName: 'Batería 12V 75Ah', category: 'Eléctrico', brand: 'Etna', model: 'Power Max 75', purchaseDate: '2026-04-05', invoice: 'F001-00412', clientId: 'u9', clientName: 'Diego Rojas', vehicle: { plate: 'HJK-321', brand: 'Nissan', model: 'Sentra', year: 2018 }, amount: 480 },
  { id: 'v5', productCode: 'AP-EM-5023', productName: 'Embrague kit completo', category: 'Transmisión', brand: 'LUK', model: 'KIT-3000', purchaseDate: '2026-04-18', invoice: 'F001-00489', clientId: 'u10', clientName: 'Karina Huamán', vehicle: { plate: 'LMN-654', brand: 'Mazda', model: '3', year: 2017 }, amount: 1250 },
  { id: 'v6', productCode: 'AP-AL-6034', productName: 'Alternador 90A', category: 'Eléctrico', brand: 'Valeo', model: 'V-90A', purchaseDate: '2026-04-01', invoice: 'F001-00521', clientId: 'u5', clientName: 'Luis Vargas', vehicle: { plate: 'AGT-128', brand: 'Toyota', model: 'Corolla', year: 2019 }, amount: 920 },
  { id: 'v7', productCode: 'AP-RT-7045', productName: 'Radiador aluminio', category: 'Refrigeración', brand: 'Denso', model: 'RA-2200', purchaseDate: '2026-04-15', invoice: 'F001-00598', clientId: 'u6', clientName: 'Ana Quispe', vehicle: { plate: 'BCD-456', brand: 'Hyundai', model: 'Accent', year: 2020 }, amount: 690 },
  { id: 'v8', productCode: 'AP-DI-8056', productName: 'Disco de freno ventilado', category: 'Frenos', brand: 'Brembo', model: 'BR-280', purchaseDate: '2026-04-03', invoice: 'F001-00667', clientId: 'u7', clientName: 'Roberto Díaz', vehicle: { plate: 'EFG-789', brand: 'Kia', model: 'Rio', year: 2021 }, amount: 410 },
];

export const initialCases: Case[] = [
  {
    id: 'c1', code: 'ZDJ-2024-0142', date: '2026-04-10', clientId: 'u5', clientName: 'Luis Vargas',
    saleId: 'v1', productName: 'Pastillas de freno cerámicas', failureType: 'Ruido anormal',
    description: 'Chillido agudo al frenar a baja velocidad. Se manifiesta principalmente en mañanas frías.',
    observations: 'Cliente reporta el problema desde el segundo día de instalación.',
    invoice: 'F001-00234', mileage: 1250, priority: 'media', status: 'validado', warrantyStatus: 'validado',
    technicalDecision: 'Se confirma defecto en compuesto del material. Procede cambio bajo garantía.',
    assignedTo: 'Jorge Ramírez', createdBy: 'María Fernández',
    warrantyChecklist: [
      { label: 'Comprobante de compra válido', checked: true },
      { label: 'Producto dentro del período de garantía', checked: true },
      { label: 'Falla atribuible al producto', checked: true },
      { label: 'Sin signos de mal uso o instalación incorrecta', checked: true },
    ],
  },
  {
    id: 'c2', code: 'ZDJ-2024-0156', date: '2026-04-22', clientId: 'u6', clientName: 'Ana Quispe',
    saleId: 'v2', productName: 'Amortiguador delantero', failureType: 'Pérdida de fluido',
    description: 'Fuga visible de aceite en el amortiguador delantero derecho a las 2 semanas de instalación.',
    observations: 'Vehículo presenta inestabilidad en curvas.',
    invoice: 'F001-00298', mileage: 850, priority: 'alta', status: 'en_revision', warrantyStatus: 'en_revision',
    assignedTo: 'Jorge Ramírez', createdBy: 'María Fernández',
  },
  {
    id: 'c3', code: 'ZDJ-2024-0163', date: '2026-04-08', clientId: 'u7', clientName: 'Roberto Díaz',
    saleId: 'v3', productName: 'Filtro de aceite premium', failureType: 'Defecto de fabricación',
    description: 'Filtro presenta fisura en la carcasa, generando filtración de aceite.',
    observations: 'Detectado en mantenimiento preventivo.',
    invoice: 'F001-00345', mileage: 320, priority: 'critica', status: 'resuelto', warrantyStatus: 'validado',
    technicalDecision: 'Defecto evidente de fabricación. Reemplazo inmediato aprobado.',
    finalResult: 'Producto reemplazado y compensación adicional por mano de obra entregada al cliente.',
    assignedTo: 'Jorge Ramírez', createdBy: 'María Fernández',
    warrantyChecklist: [
      { label: 'Comprobante de compra válido', checked: true },
      { label: 'Producto dentro del período de garantía', checked: true },
      { label: 'Falla atribuible al producto', checked: true },
      { label: 'Sin signos de mal uso o instalación incorrecta', checked: true },
    ],
  },
  {
    id: 'c4', code: 'ZDJ-2024-0178', date: '2026-04-21', clientId: 'u9', clientName: 'Diego Rojas',
    saleId: 'v4', productName: 'Batería 12V 75Ah', failureType: 'Fallo eléctrico',
    description: 'Batería pierde carga en menos de 24 horas sin uso. Voltaje cae a 10.2V.',
    observations: 'Sistema eléctrico del vehículo previamente revisado y descartado.',
    invoice: 'F001-00412', mileage: 0, priority: 'alta', status: 'observado', warrantyStatus: 'observado',
    technicalDecision: 'Se requieren pruebas adicionales con equipo de carga controlada.',
    assignedTo: 'Jorge Ramírez', createdBy: 'María Fernández',
  },
  {
    id: 'c5', code: 'ZDJ-2024-0185', date: '2026-04-12', clientId: 'u10', clientName: 'Karina Huamán',
    saleId: 'v5', productName: 'Embrague kit completo', failureType: 'Vibración excesiva',
    description: 'Vibración fuerte en pedal de embrague al iniciar marcha. Cliente reporta dificultad en cambios.',
    observations: 'Posible problema de balanceo del disco.',
    invoice: 'F001-00489', mileage: 2100, priority: 'media', status: 'recibido', warrantyStatus: 'pendiente',
    createdBy: 'María Fernández',
  },
  {
    id: 'c6', code: 'ZDJ-2024-0192', date: '2026-04-20', clientId: 'u5', clientName: 'Luis Vargas',
    saleId: 'v6', productName: 'Alternador 90A', failureType: 'Fallo eléctrico',
    description: 'Alternador no carga correctamente. Luz de batería encendida en tablero.',
    observations: '',
    invoice: 'F001-00521', mileage: 540, priority: 'alta', status: 'cerrado', warrantyStatus: 'rechazado',
    technicalDecision: 'Se detectó instalación incorrecta por terceros. No procede garantía.',
    finalResult: 'Caso cerrado. Se brindó orientación al cliente para reinstalación correcta.',
    assignedTo: 'Jorge Ramírez', createdBy: 'María Fernández', closedAt: '2024-12-01',
  },
  {
    id: 'c7', code: 'ZDJ-2024-0201', date: '2026-04-05', clientId: 'u6', clientName: 'Ana Quispe',
    saleId: 'v7', productName: 'Radiador aluminio', failureType: 'Pérdida de fluido',
    description: 'Filtración de refrigerante por unión soldada del radiador.',
    observations: 'Pieza nueva, instalada hace 15 días.',
    invoice: 'F001-00598', mileage: 480, priority: 'critica', status: 'en_revision', warrantyStatus: 'en_revision',
    assignedTo: 'Jorge Ramírez', createdBy: 'María Fernández',
  },
  {
    id: 'c8', code: 'ZDJ-2024-0215', date: '2026-04-18', clientId: 'u7', clientName: 'Roberto Díaz',
    saleId: 'v8', productName: 'Disco de freno ventilado', failureType: 'Desgaste prematuro',
    description: 'Desgaste irregular del disco a los 3000 km. Surcos visibles en superficie.',
    observations: 'Cliente afirma uso normal urbano.',
    invoice: 'F001-00667', mileage: 3100, priority: 'media', status: 'recibido', warrantyStatus: 'pendiente',
    createdBy: 'María Fernández',
  },
];

export const initialEvidences: Evidence[] = [
  { id: 'e1', caseId: 'c1', name: 'pastilla_frontal.jpg', type: 'foto', size: 245000, uploadedAt: '2026-04-10', uploadedBy: 'María Fernández', comment: 'Vista frontal del desgaste irregular' },
  { id: 'e2', caseId: 'c1', name: 'comprobante_F001-00234.pdf', type: 'comprobante', size: 89000, uploadedAt: '2026-04-10', uploadedBy: 'María Fernández' },
  { id: 'e3', caseId: 'c1', name: 'reporte_tecnico.pdf', type: 'documento', size: 320000, uploadedAt: '2026-04-12', uploadedBy: 'Jorge Ramírez', comment: 'Análisis técnico completo' },
  { id: 'e4', caseId: 'c2', name: 'fuga_amortiguador.jpg', type: 'foto', size: 410000, uploadedAt: '2026-04-22', uploadedBy: 'María Fernández', comment: 'Aceite visible en carcasa' },
  { id: 'e5', caseId: 'c2', name: 'comprobante_F001-00298.pdf', type: 'comprobante', size: 92000, uploadedAt: '2026-04-22', uploadedBy: 'María Fernández' },
  { id: 'e6', caseId: 'c3', name: 'fisura_filtro.jpg', type: 'foto', size: 280000, uploadedAt: '2026-04-08', uploadedBy: 'María Fernández', comment: 'Fisura en carcasa exterior' },
  { id: 'e7', caseId: 'c3', name: 'fisura_detalle.jpg', type: 'foto', size: 305000, uploadedAt: '2026-04-08', uploadedBy: 'María Fernández' },
  { id: 'e8', caseId: 'c3', name: 'comprobante_F001-00345.pdf', type: 'comprobante', size: 84000, uploadedAt: '2024-10-08', uploadedBy: 'María Fernández' },
  { id: 'e9', caseId: 'c4', name: 'medicion_voltaje.jpg', type: 'foto', size: 195000, uploadedAt: '2026-04-26', uploadedBy: 'Jorge Ramírez', comment: 'Multímetro mostrando 10.2V' },
  { id: 'e10', caseId: 'c5', name: 'comprobante_F001-00489.pdf', type: 'comprobante', size: 95000, uploadedAt: '2026-04-08', uploadedBy: 'María Fernández' },
  { id: 'e11', caseId: 'c7', name: 'fuga_radiador.jpg', type: 'foto', size: 350000, uploadedAt: '2026-04-05', uploadedBy: 'María Fernández' },
  { id: 'e12', caseId: 'c7', name: 'comprobante_F001-00598.pdf', type: 'comprobante', size: 88000, uploadedAt: '2026-04-05', uploadedBy: 'María Fernández' },
];

export const initialHistory: HistoryEntry[] = [
  { id: 'h1', caseId: 'c1', date: '2026-04-10T09:15:00', user: 'María Fernández', role: 'asesor', action: 'Caso creado', toStatus: 'recibido', comment: 'Reclamo registrado tras visita del cliente' },
  { id: 'h2', caseId: 'c1', date: '2026-04-11T11:30:00', user: 'María Fernández', role: 'asesor', action: 'Asignado a evaluación técnica', fromStatus: 'recibido', toStatus: 'en_revision' },
  { id: 'h3', caseId: 'c1', date: '2026-04-13T14:20:00', user: 'Jorge Ramírez', role: 'tecnico', action: 'Evaluación técnica completada', fromStatus: 'en_revision', toStatus: 'validado', comment: 'Defecto confirmado en material. Procede garantía.' },

  { id: 'h4', caseId: 'c2', date: '2026-04-22T10:00:00', user: 'María Fernández', role: 'asesor', action: 'Caso creado', toStatus: 'recibido' },
  { id: 'h5', caseId: 'c2', date: '2026-04-23T09:45:00', user: 'Jorge Ramírez', role: 'tecnico', action: 'Iniciada revisión técnica', fromStatus: 'recibido', toStatus: 'en_revision' },

  { id: 'h6', caseId: 'c3', date: '2026-04-08T08:30:00', user: 'María Fernández', role: 'asesor', action: 'Caso creado con prioridad crítica', toStatus: 'recibido' },
  { id: 'h7', caseId: 'c3', date: '2026-04-08T15:00:00', user: 'Jorge Ramírez', role: 'tecnico', action: 'Validación inmediata', fromStatus: 'recibido', toStatus: 'validado' },
  { id: 'h8', caseId: 'c3', date: '2026-04-10T11:15:00', user: 'María Fernández', role: 'asesor', action: 'Reemplazo entregado al cliente', fromStatus: 'validado', toStatus: 'resuelto' },

  { id: 'h9', caseId: 'c4', date: '2026-04-15T16:20:00', user: 'María Fernández', role: 'asesor', action: 'Caso creado', toStatus: 'recibido' },
  { id: 'h10', caseId: 'c4', date: '2026-04-14T10:00:00', user: 'Jorge Ramírez', role: 'tecnico', action: 'Requiere pruebas adicionales', fromStatus: 'recibido', toStatus: 'observado', comment: 'Solicitud de pruebas con equipo controlado' },

  { id: 'h11', caseId: 'c5', date: '2026-04-08T13:40:00', user: 'María Fernández', role: 'asesor', action: 'Caso creado', toStatus: 'recibido' },

  { id: 'h12', caseId: 'c6', date: '2026-04-20T09:00:00', user: 'María Fernández', role: 'asesor', action: 'Caso creado', toStatus: 'recibido' },
  { id: 'h13', caseId: 'c6', date: '2026-04-20T14:30:00', user: 'Jorge Ramírez', role: 'tecnico', action: 'Evaluación técnica', fromStatus: 'recibido', toStatus: 'en_revision' },
  { id: 'h14', caseId: 'c6', date: '2026-04-21T16:45:00', user: 'Jorge Ramírez', role: 'tecnico', action: 'Garantía rechazada por mala instalación', fromStatus: 'en_revision', toStatus: 'rechazado' },
  { id: 'h15', caseId: 'c6', date: '2026-04-01T10:00:00', user: 'Carlos Mendoza', role: 'administrador', action: 'Caso cerrado', fromStatus: 'rechazado', toStatus: 'cerrado', comment: 'Orientación brindada al cliente' },

  { id: 'h16', caseId: 'c7', date: '2026-04-05T11:00:00', user: 'María Fernández', role: 'asesor', action: 'Caso crítico creado', toStatus: 'recibido' },
  { id: 'h17', caseId: 'c7', date: '2026-04-06T09:30:00', user: 'Jorge Ramírez', role: 'tecnico', action: 'Inicio de evaluación urgente', fromStatus: 'recibido', toStatus: 'en_revision' },

  { id: 'h18', caseId: 'c8', date: '2026-04-18T14:00:00', user: 'María Fernández', role: 'asesor', action: 'Caso creado', toStatus: 'recibido' },
];
