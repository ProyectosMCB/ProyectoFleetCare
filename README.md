# ProyectoFleetCare
### Sistema Web para Gestión y Mantenimiento Predictivo de Flotas Vehiculares

Curso: JavaScript Avanzado — Unidad 1
Universidad Tecnológica del Perú

---

## Etapa 1 — Análisis del problema

**¿Qué problema se desea solucionar?**
Muchas empresas con flotas de vehículos (transporte, delivery, construcción, distribución)
no cuentan con un sistema simple para saber cuándo cada unidad necesita mantenimiento.
El resultado es un mantenimiento **reactivo**: se repara el vehículo recién cuando ya
falló en ruta, en lugar de anticiparse al desgaste.

**¿Quiénes tienen el problema?**
Encargados de flota, jefes de operaciones y mecánicos responsables de varios vehículos
a la vez, que necesitan decidir rápidamente cuáles unidades revisar primero.

**¿Dónde se presenta?**
En pequeñas y medianas empresas de transporte de carga o pasajeros, donde el control de
mantenimiento se sigue llevando en cuadernos, hojas de cálculo sueltas o de memoria.

**¿Qué información necesita procesarse?**
Placa, tipo de vehículo, kilometraje actual, kilometraje y fecha del último
mantenimiento. A partir de estos datos se calcula cuánto se ha usado el vehículo desde
su última revisión (en kilómetros y en meses).

**¿Qué dificultades existen actualmente?**
No hay alertas automáticas; el control depende de la memoria del encargado; es fácil
perder de vista un vehículo cuando la flota crece; no existe una vista rápida que
priorice qué unidades revisar primero.

**¿Cómo ayuda la aplicación propuesta?**
FleetCare centraliza el registro de toda la flota y calcula automáticamente, con cada
vehículo, un estado predictivo (**Al día / Próximo / Urgente**) según kilometraje y
tiempo transcurrido. El encargado ve de un vistazo qué vehículos requieren atención
inmediata, puede buscar por placa, filtrar por estado y marcar un mantenimiento como
realizado.

---

## Etapa 2 — Entradas, procesos y salidas

**Entradas (datos que ingresa el usuario mediante el formulario):**
- Placa del vehículo
- Tipo de vehículo (camión, furgón, camioneta, bus, auto)
- Kilometraje actual
- Kilometraje del último mantenimiento
- Fecha del último mantenimiento
- Observaciones (opcional)
- Texto de búsqueda por placa y estado seleccionado en el filtro

**Procesos (operaciones que realiza JavaScript):**
- Validar el formato de la placa (expresión regular) y que los datos numéricos sean
  coherentes (km actual no puede ser menor al km del último mantenimiento).
- Calcular kilómetros recorridos desde el último mantenimiento.
- Calcular meses transcurridos desde la fecha del último mantenimiento.
- Determinar el estado predictivo (Urgente / Próximo / Al día) combinando ambos
  cálculos con operadores lógicos y condicionales.
- Filtrar y ordenar la flota según lo que el usuario busca o selecciona.
- Guardar y recuperar la flota en el almacenamiento local del navegador.

**Salidas (información que ve el usuario):**
- Tabla con todos los vehículos registrados, su estado y su vida útil restante.
- Tablero superior con contadores: total, urgentes, próximos y al día.
- Mensajes de éxito o error tras cada acción (registrar, eliminar, marcar
  mantenimiento).

---

## Estructura de carpetas

```
proyecto-javascript/
│
├── index.html        Estructura de la interfaz (HTML)
├── css/
│   └── estilos.css   Estilos visuales (CSS)
├── js/
│   └── app.js         Toda la lógica de la aplicación (JavaScript)
└── README.md          Este archivo
```

## Tecnologías utilizadas
- HTML5 semántico (sin frameworks)
- CSS3 (variables, Flexbox, Grid, diseño responsivo)
- JavaScript (ES6+): variables/constantes, funciones, arreglos, objetos,
  spread, expresiones regulares, eventos, DOM, Math, try/catch, localStorage.

## Cómo ejecutar el proyecto
Abrir `index.html` directamente en cualquier navegador moderno (Chrome, Edge, Firefox).
No requiere instalación ni servidor.

## Mapa de requerimientos de la Etapa 5 (dónde encontrarlos en app.js)

| # | Requerimiento | Dónde está |
|---|----------------|-----------|
| 1 | Variables y constantes | Inicio del archivo |
| 2 | Tipos de datos | `crearVehiculo()` |
| 3 | Operadores matemáticos | `calcularDiagnostico()` |
| 4 | Operadores de comparación | `calcularEstado()`, `validarDatosFormulario()` |
| 5 | Operadores lógicos | `calcularEstado()`, `obtenerFlotaFiltrada()` |
| 6 | Estructuras condicionales | `calcularEstado()` |
| 7 | Funciones | Todo el archivo (una responsabilidad por función) |
| 8 | Manejo de cadenas | `normalizarPlaca()` (trim, toUpperCase), `obtenerFlotaFiltrada()` (toLowerCase, includes), `crearFilaHTML()` (replace), `formatearKilometraje()` (toLocaleString) |
| 9 | Interpolación (template literals) | `crearFilaHTML()` |
| 10 | Expresiones regulares | `PATRON_PLACA`, `validarFormatoPlaca()` |
| 11 | Arreglos | `flota`, `obtenerFlotaFiltrada()`, `.push()`, `.filter()` |
| 12 | Objetos | `crearVehiculo()` |
| 13 | Operador spread | `confirmarPanelMantenimiento()`, `obtenerFlotaOrdenadaPorUrgencia()` |
| 14 | Eventos | `submit`, `input`, `change`, `click` (al final del archivo) |
| 15 | Manipulación del DOM | `renderizarTabla()`, `renderizarIndicadores()` |
| 16 | Objeto Math | `Math.round`, `Math.min`, `Math.max`, `Math.floor`, `Math.random` |
| 17 | Validación de datos | `validarDatosFormulario()` |
| 18 | Mensajes al usuario | `mostrarMensajeFormulario()` |
| 19 | Manejo de errores (try/catch) | `guardarEnAlmacenamiento()`, `cargarDesdeAlmacenamiento()` |