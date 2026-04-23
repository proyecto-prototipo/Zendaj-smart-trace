# ZENDAJ SMART-TRACE

## Descripción

**ZENDAJ SMART-TRACE** es un prototipo web orientado a la **gestión postventa de autopartes**, diseñado para mejorar la **trazabilidad de incidencias, reclamos, garantías, evidencias y seguimiento de casos**.

El proyecto nace como respuesta a una problemática frecuente en el sector automotriz: después de la venta, los reclamos por fallas, solicitudes de garantía y consultas técnicas suelen gestionarse de manera manual, con información dispersa, evidencia mal organizada, poca visibilidad del proceso y escasa trazabilidad. Esto genera demoras, errores, desconfianza y una experiencia deficiente para el cliente.

Este prototipo propone una solución digital modular que permite centralizar la información postventa, ordenar el flujo de atención y convertir un proceso manual en una operación más clara, eficiente y medible.

---

## Problema que resuelve

En muchos negocios de autopartes, la atención postventa presenta problemas como:

- registro manual o incompleto de reclamos,
- dificultad para vincular incidencias con compras reales,
- pérdida o desorganización de evidencias,
- poca claridad en el estado de cada caso,
- escaso seguimiento interno,
- baja visibilidad para el cliente,
- falta de indicadores útiles para gerencia.

ZENDAJ SMART-TRACE busca resolver estos puntos mediante una plataforma que permita registrar, validar, monitorear y analizar cada caso de forma estructurada.

---

## Objetivo general

Desarrollar un **Producto Mínimo Viable (PMV)** que permita:

- registrar usuarios, clientes y ventas asociadas,
- registrar incidencias o reclamos,
- adjuntar y organizar evidencias,
- validar garantías de manera estructurada,
- dar seguimiento y trazabilidad a cada caso,
- mostrar indicadores de operación y gestión,
- mejorar la experiencia postventa y la toma de decisiones.

---

## Objetivos específicos

- Digitalizar el proceso de atención postventa en autopartes.
- Reducir la pérdida de información en garantías y reclamos.
- Mejorar la trazabilidad del caso desde su apertura hasta su cierre.
- Estandarizar el flujo de revisión y validación.
- Facilitar la consulta del estado del reclamo por parte del cliente.
- Proveer a gerencia información visual y analítica para identificar oportunidades de mejora.

---

## Alcance del prototipo

Este prototipo está pensado como un **PMV funcional**, enfocado en validar la solución con los módulos esenciales del proceso postventa.

### Incluye

- gestión de usuarios y clientes,
- registro de productos y ventas asociadas,
- registro de incidencias o reclamos,
- gestión de evidencias,
- validación de garantía,
- seguimiento y trazabilidad del caso,
- dashboard con indicadores,
- administración básica del sistema,
- acceso diferenciado por roles.

### Excluye

- integración real con ERP o facturación,
- blockchain real,
- inteligencia artificial en producción,
- integración en tiempo real con proveedores externos,
- aplicación móvil nativa,
- backend productivo definitivo.

---

## Propuesta de valor

ZENDAJ SMART-TRACE transforma la postventa en una operación:

- **más ordenada**, porque centraliza información clave;
- **más trazable**, porque registra el recorrido completo del caso;
- **más transparente**, porque permite consultar estados, responsables y observaciones;
- **más eficiente**, porque reduce tiempos muertos y desorganización;
- **más medible**, porque genera indicadores útiles para operación y gerencia.

---

## Roles del sistema

El prototipo está organizado por roles, cada uno con accesos y funciones específicas.

### Administrador
Gestiona la configuración general del sistema.

Funciones principales:
- administrar usuarios,
- asignar roles,
- configurar estados del caso,
- definir tipos de incidencia,
- mantener parámetros del sistema,
- revisar indicadores generales.

### Asesor Postventa
Gestiona la atención operativa de reclamos y garantías.

Funciones principales:
- registrar clientes,
- registrar ventas asociadas,
- abrir incidencias,
- adjuntar evidencias,
- actualizar estados,
- dar seguimiento al caso.

### Técnico Evaluador
Revisa técnicamente la incidencia y estructura la validación de garantía.

Funciones principales:
- analizar la información del caso,
- revisar evidencias,
- registrar observaciones técnicas,
- emitir resultado preliminar,
- consultar historial del caso.

### Cliente
Participa activamente en su propio proceso postventa.

Funciones principales:
- registrar una incidencia o reclamo,
- adjuntar información inicial,
- consultar el estado del caso,
- visualizar observaciones,
- revisar el seguimiento,
- visualizar el resultado final.

### Gerencia
Visualiza información ejecutiva para toma de decisiones.

Funciones principales:
- revisar indicadores,
- analizar tiempos de respuesta,
- monitorear volumen de incidencias,
- revisar tipos de fallas recurrentes,
- detectar oportunidades de mejora.

---

## Módulos principales

### 1. Registro de usuarios y clientes
Permite registrar, editar y consultar clientes y usuarios internos del sistema.

Incluye:
- creación de clientes,
- creación de usuarios,
- edición de información,
- activación o desactivación,
- búsqueda y filtrado por rol o tipo de usuario.

---

### 2. Registro de productos y ventas asociadas
Permite vincular una incidencia con una compra real y con la autoparte correspondiente.

Incluye:
- registro de producto vendido,
- asociación con cliente,
- fecha de compra,
- comprobante,
- datos del vehículo.

---

### 3. Registro de incidencias o reclamos
Es uno de los módulos centrales del prototipo.

Incluye:
- creación de nuevos casos,
- descripción del problema,
- tipo de falla,
- prioridad,
- observaciones,
- generación automática de código de caso.

---

### 4. Gestión de evidencias
Centraliza todos los soportes relacionados con el reclamo.

Incluye:
- carga de fotos,
- carga de comprobantes,
- observaciones técnicas,
- visualización de archivos,
- relación obligatoria de evidencia con un caso.

---

### 5. Validación de garantía
Organiza la revisión inicial del reclamo para determinar si puede pasar a evaluación.

Incluye:
- revisión de fecha de compra,
- revisión de tipo de producto,
- análisis de condición reportada,
- revisión de evidencia,
- observaciones del técnico,
- decisión preliminar.

---

### 6. Seguimiento y trazabilidad del caso
Es el núcleo del sistema, ya que muestra el recorrido completo de cada incidencia.

Incluye:
- estado del caso,
- historial de cambios,
- responsables,
- comentarios,
- fechas de actualización,
- cierre y resultado final.

Estados sugeridos:
- recibido,
- en revisión,
- observado,
- validado,
- resuelto,
- cerrado.

---

### 7. Dashboard e indicadores
Permite visualizar métricas operativas y ejecutivas.

Incluye:
- total de incidencias,
- casos abiertos,
- casos cerrados,
- tiempos promedio de atención,
- incidencias por estado,
- fallas recurrentes,
- tendencias por fechas.

Para gerencia, se consideran visualizaciones como:
- gráficos circulares por tipo de falla,
- gráficos de barras con línea de tendencia/EMA para tiempos de respuesta,
- indicadores resumen y reportes visuales.

---

### 8. Administración y configuración
Permite mantener el orden y la escalabilidad del prototipo.

Incluye:
- tipos de incidencia,
- estados del caso,
- parámetros básicos del sistema,
- reglas operativas,
- configuración general.

---

## Flujo general del sistema

1. El cliente reporta una falla o solicita garantía.
2. Se registra el cliente y la venta asociada.
3. Se crea la incidencia o reclamo.
4. Se adjuntan evidencias.
5. El técnico evaluador revisa el caso.
6. Se realiza la validación inicial de garantía.
7. El sistema actualiza estados y deja trazabilidad.
8. El cliente consulta el avance.
9. El caso se resuelve y se cierra.
10. Gerencia visualiza indicadores y oportunidades de mejora.

---

## Funcionalidades clave del prototipo

- navegación por roles,
- login con acceso diferenciado,
- formularios funcionales,
- validaciones visuales,
- filtros y búsquedas,
- tablas interactivas,
- modales y ventanas funcionales,
- dashboards con gráficos,
- persistencia local para fines de demostración,
- experiencia visual orientada a un entorno SaaS moderno.

---

## Reglas de negocio consideradas

- cada reclamo debe tener un código único,
- ningún caso puede cerrarse sin estado final,
- todo cambio de estado debe dejar historial,
- toda evidencia debe estar vinculada a un caso,
- si falta información clave, el sistema debe marcarlo como pendiente,
- la validación de garantía no es automática,
- el historial del caso no debe borrarse,
- no se deben inferir datos que no fueron registrados.

---

## Tecnologías del proyecto

Este repositorio corresponde a un prototipo frontend. La implementación puede incluir tecnologías como:

- **React**
- **TypeScript**
- **Vite**
- **CSS / Tailwind / sistema de componentes UI** según la configuración del proyecto
