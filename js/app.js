/* 
   REQUERIMIENTO 1 — VARIABLES Y CONSTANTES (let, const)
   Usamos "const" para valores que NUNCA deben reasignarse (reglas de
   negocio, referencias a elementos del DOM) y "let" para valores que
   sí cambian mientras el usuario interactúa con la app.                */

// --- Reglas del negocio (constantes: nunca cambian en tiempo de ejecución) ---
const KM_LIMITE_URGENTE = 5000;     // si recorrió >= 5000 km sin mantenimiento -> Urgente
const KM_LIMITE_PROXIMO = 3500;     // si recorrió >= 3500 km sin mantenimiento -> Próximo
const MESES_LIMITE_URGENTE = 6;     // si pasaron >= 6 meses sin mantenimiento -> Urgente
const MESES_LIMITE_PROXIMO = 4;     // si pasaron >= 4 meses sin mantenimiento -> Próximo
const CLAVE_ALMACENAMIENTO = 'fleetcare_flota'; // clave usada en localStorage
const PATRON_PLACA = /^[A-Z]{3}-\d{3}$/;        // REQUERIMIENTO 10 (se explica más abajo)
const TIPOS_SERVICIO = [
  'Mantenimiento preventivo', 'Mantenimiento correctivo', 'Cambio de aceite',
  'Revisión de frenos', 'Revisión de neumáticos', 'Motor', 'Sistema eléctrico', 'Otro'
];

// --- Referencias a elementos del DOM (constantes: el elemento no cambia, su contenido sí) ---
const formulario = document.getElementById('form-vehiculo');
const inputPlaca = document.getElementById('placa');
const inputTipo = document.getElementById('tipo');
const inputKmActual = document.getElementById('km-actual');
const inputKmMantenimiento = document.getElementById('km-mantenimiento');
const inputFechaMantenimiento = document.getElementById('fecha-mantenimiento');
const inputTipoServicio = document.getElementById('tipo-servicio');
const inputCosto = document.getElementById('costo');
const inputObservaciones = document.getElementById('observaciones');
const errorPlaca = document.getElementById('error-placa');
const mensajeForm = document.getElementById('mensaje-form');

const cuerpoTabla = document.getElementById('cuerpo-tabla');
const tablaVacia = document.getElementById('tabla-vacia');
const inputBuscarPlaca = document.getElementById('buscar-placa');
const selectFiltroEstado = document.getElementById('filtro-estado');
const botonOrdenar = document.getElementById('btn-ordenar');

const indTotal = document.getElementById('ind-total');
const indUrgente = document.getElementById('ind-urgente');
const indProximo = document.getElementById('ind-proximo');
const indOk = document.getElementById('ind-ok');
const indCostoTotal = document.getElementById('ind-costo-total');
const indCostoPromedio = document.getElementById('ind-costo-promedio');
const indCostoMaximo = document.getElementById('ind-costo-maximo');
const indCostoMinimo = document.getElementById('ind-costo-minimo');

// --- Estado de la aplicación (let: sí cambia con cada acción del usuario) ---
let flota = [];                    // REQUERIMIENTO 11: arreglo con todos los vehículos
let filtroTextoActual = '';        // texto que el usuario escribió para buscar
let filtroEstadoActual = 'todos';  // estado seleccionado en el <select>
let ordenarPorUrgencia = false;    // interruptor para el botón "Ordenar"
let idVehiculoEnMantenimiento = null; // id del vehículo que tiene abierto el panel "Marcar mantenimiento" (null = ninguno)


/* =====================================================================
   REQUERIMIENTO 2 — TIPOS DE DATOS (string, number, boolean, array, object)
   =====================================================================
   Función que crea el OBJETO "vehículo" (REQUERIMIENTO 12: representa
   una entidad del mundo real). Aquí conviven los 5 tipos de dato
   pedidos: string (placa/tipo), number (kilometrajes), boolean
   (resultado de comparaciones), array (flota) y object (el vehículo
   mismo).                                                              */
function crearVehiculo(datos) {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000), // REQUERIMIENTO 16 (Math)
    placa: datos.placa,                 // string
    tipo: datos.tipo,                   // string
    kmActual: datos.kmActual,           // number
    kmMantenimiento: datos.kmMantenimiento, // number
    fechaMantenimiento: datos.fechaMantenimiento, // string (formato AAAA-MM-DD)
    tipoServicio: datos.tipoServicio,   // string: qué tipo de servicio fue (preventivo, cambio de aceite, etc.)
    observaciones: datos.observaciones, // string
    costoUltimoMantenimiento: datos.costo,  // number: lo que costó la última vez
    costoTotalInvertido: datos.costo,       // number: acumulado histórico en este vehículo
    activo: true                        // boolean
  };
}


/* =====================================================================
   REQUERIMIENTO 7 — FUNCIONES (cada una con una sola responsabilidad)
   REQUERIMIENTO 3 — OPERADORES MATEMÁTICOS (al menos 3, ligados al problema)
   REQUERIMIENTO 16 — OBJETO Math (al menos 3 métodos/propiedades)
   =====================================================================
   Esta función calcula, a partir del objeto vehículo, los tres datos
   numéricos que sostienen todo el "mantenimiento predictivo":
     1) kilómetros recorridos desde el último mantenimiento (resta)
     2) meses transcurridos desde esa fecha (resta de fechas / división)
     3) porcentaje de vida útil restante del mantenimiento (regla de 3)  */
function calcularDiagnostico(vehiculo) {
  // Operación matemática 1: resta simple -> km recorridos sin mantenimiento
  const kmRecorridos = vehiculo.kmActual - vehiculo.kmMantenimiento;

  // Operación matemática 2: diferencia de fechas en milisegundos -> meses
  const hoy = new Date();
  const fechaMantenimiento = new Date(vehiculo.fechaMantenimiento);
  const milisegundosPorMes = 1000 * 60 * 60 * 24 * 30; // ms en un mes aprox.
  const diferenciaMs = hoy.getTime() - fechaMantenimiento.getTime();
  // Math.floor: redondea hacia abajo (no contamos un mes que no se completó)
  const mesesTranscurridos = Math.floor(diferenciaMs / milisegundosPorMes);

  // Operación matemática 3: porcentaje de vida útil restante del mantenimiento
  // (regla de tres simple, usando el límite urgente como el 100% del ciclo)
  const porcentajeUsado = (kmRecorridos / KM_LIMITE_URGENTE) * 100;
  // Math.min / Math.max: evitan que el porcentaje se salga del rango 0-100
  const vidaUtilRestante = Math.max(0, Math.min(100, Math.round(100 - porcentajeUsado)));

  return { kmRecorridos, mesesTranscurridos, vidaUtilRestante };
}


/* =====================================================================
   REQUERIMIENTO 4 — OPERADORES DE COMPARACIÓN (>, <, >=, <=, ===, !==)
   REQUERIMIENTO 5 — OPERADORES LÓGICOS (&&, ||, !)
   REQUERIMIENTO 6 — ESTRUCTURAS CONDICIONALES (if / else if / else)
   =====================================================================
   Decide el estado predictivo del vehículo combinando kilometraje Y/O
   tiempo transcurrido: si CUALQUIERA de los dos supera el límite
   urgente, el vehículo es urgente (por eso se usa el operador ||).      */
function calcularEstado(kmRecorridos, mesesTranscurridos) {
  const esUrgentePorKm = kmRecorridos >= KM_LIMITE_URGENTE;   // >=
  const esUrgentePorTiempo = mesesTranscurridos >= MESES_LIMITE_URGENTE; // >=
  const esProximoPorKm = kmRecorridos >= KM_LIMITE_PROXIMO;
  const esProximoPorTiempo = mesesTranscurridos >= MESES_LIMITE_PROXIMO;

  if (esUrgentePorKm || esUrgentePorTiempo) {
    // Operador lógico OR: basta con que UNA condición se cumpla
    return 'Urgente';
  } else if (esProximoPorKm || esProximoPorTiempo) {
    return 'Próximo';
  } else if (kmRecorridos < 0) {
    // Comparación "<" para detectar datos inconsistentes (km mal ingresado)
    return 'Dato inválido';
  } else {
    return 'Al día';
  }
}


/* =====================================================================
   REQUERIMIENTO 10 — EXPRESIONES REGULARES
   =====================================================================
   ¿Qué valida?  Que la placa tenga el formato peruano clásico: 3 letras
                 mayúsculas, un guion y 3 números (Ej: "ABC-123").
   ¿Qué significa el patrón /^[A-Z]{3}-\d{3}$/ ?
       ^          -> inicio del texto
       [A-Z]{3}   -> exactamente 3 letras mayúsculas
       -          -> un guion literal
       \d{3}      -> exactamente 3 dígitos
       $          -> fin del texto (no admite caracteres extra)
   ¿Qué sucede si no cumple? El formulario NO registra el vehículo y se
       muestra un mensaje de error en rojo debajo del campo "Placa"
       (ver REQUERIMIENTO 17 y 18 más abajo).                           */
function validarFormatoPlaca(placa) {
  return PATRON_PLACA.test(placa);
}


/* =====================================================================
   REQUERIMIENTO 8 — MANEJO DE CADENAS (mínimo 5 métodos/propiedades)
   =====================================================================
   Métodos usados en el archivo: trim(), toUpperCase() (aquí abajo),
   toLowerCase() e includes() (en obtenerFlotaFiltrada) y replace()
   (en crearFilaHTML, para armar la clase CSS del estado).             */
function normalizarPlaca(textoPlaca) {
  return textoPlaca
    .trim()          // 1) elimina espacios al inicio/final
    .toUpperCase();   // 2) convierte todo a mayúsculas
}

function formatearKilometraje(numero) {
  // toLocaleString(): agrega separador de miles ("6,000" en vez de "006000").
  // Antes se usaba padStart() para rellenar a 6 dígitos, pero eso hacía que
  // 6000 km se mostrara como "006000 km", que parece un error de captura.
  return `${numero.toLocaleString('es-PE')} km`;
}


/* =====================================================================
   REQUERIMIENTO 17 — VALIDACIÓN DE DATOS
   REQUERIMIENTO 18 — MENSAJES AL USUARIO
   =====================================================================
   Revisa todos los campos del formulario ANTES de crear el vehículo y
   devuelve una lista de errores. Si la lista está vacía, los datos son
   válidos.                                                             */
function validarDatosFormulario(datos) {
  const errores = [];

  if (!validarFormatoPlaca(datos.placa)) {
    errores.push('La placa debe tener el formato ABC-123.');
  }
  if (flota.some(v => v.placa === datos.placa)) {
    // .some(): recorre el arreglo y verifica si YA existe esa placa
    errores.push('Ya existe un vehículo registrado con esa placa.');
  }
  if (datos.tipo === '') {
    errores.push('Selecciona un tipo de vehículo.');
  }
  if (datos.tipoServicio === '') {
    errores.push('Selecciona el tipo de servicio realizado.');
  }
  // isNaN + comparación: valida que sean números reales y no negativos
  if (isNaN(datos.kmActual) || datos.kmActual < 0) {
    errores.push('El kilometraje actual no es válido.');
  }
  if (isNaN(datos.kmMantenimiento) || datos.kmMantenimiento < 0) {
    errores.push('El kilometraje del último mantenimiento no es válido.');
  }
  // Operador !== : el km actual NUNCA puede ser menor al del mantenimiento previo
  if (datos.kmActual !== undefined && datos.kmMantenimiento !== undefined &&
      datos.kmActual < datos.kmMantenimiento) {
    errores.push('El km actual no puede ser menor al km del último mantenimiento.');
  }
  if (!datos.fechaMantenimiento) {
    errores.push('Indica la fecha del último mantenimiento.');
  }
  if (isNaN(datos.costo) || datos.costo < 0) {
    errores.push('El costo del mantenimiento no es válido.');
  }

  return errores;
}


/* =====================================================================
   REQUERIMIENTO 18 — MENSAJES AL USUARIO (retroalimentación visual)
   ===================================================================== */
function mostrarMensajeFormulario(texto, tipo) {
  // textContent: cambia el texto sin interpretar HTML (más seguro)
  mensajeForm.textContent = texto;
  // classList: agrega/quita clases CSS para pintar el mensaje de verde o rojo
  mensajeForm.classList.remove('exito', 'error');
  mensajeForm.classList.add(tipo);

  // El mensaje desaparece solo después de unos segundos
  setTimeout(() => {
    mensajeForm.textContent = '';
    mensajeForm.classList.remove('exito', 'error');
  }, 4000);
}


/* =====================================================================
   REQUERIMIENTO 19 — MANEJO DE ERRORES (try / catch)
   =====================================================================
   Guarda la flota en localStorage. JSON.stringify puede lanzar un error
   si el dato tuviera referencias circulares, por eso se envuelve en
   try/catch: así la app nunca se "rompe" en silencio.                  */
function guardarEnAlmacenamiento() {
  try {
    localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(flota));
  } catch (error) {
    console.error('No se pudo guardar la flota:', error);
    mostrarMensajeFormulario('Aviso: no se pudo guardar localmente en este navegador.', 'error');
  }
}

/* Carga la flota guardada. JSON.parse puede lanzar un error si el dato
   almacenado está corrupto; el catch evita que la página se caiga y en
   su lugar arranca con una flota vacía.                                */
function cargarDesdeAlmacenamiento() {
  try {
    const guardado = localStorage.getItem(CLAVE_ALMACENAMIENTO);
    return guardado ? JSON.parse(guardado) : [];
  } catch (error) {
    console.error('El almacenamiento local estaba corrupto, se reinicia la flota:', error);
    return [];
  }
}


/* =====================================================================
   REQUERIMIENTO 13 — OPERADOR SPREAD (...)
   =====================================================================
   Se usa para actualizar un vehículo SIN mutar el objeto original: se
   crea una copia con { ...vehiculo, cambios }. Esto evita efectos
   secundarios inesperados en el arreglo "flota" (buena práctica al
   trabajar con estado). También se usa para clonar el arreglo antes de
   ordenarlo, así .sort() no altera el orden original de registro.      */
/* Abre, dentro de la misma tabla (sin ventana emergente), el panel para
   registrar el mantenimiento del vehículo con el id indicado. */
function abrirPanelMantenimiento(id) {
  idVehiculoEnMantenimiento = id;
  renderizarTabla();
  // Enfoca el primer campo del panel recién abierto para que el usuario
  // pueda empezar a escribir de inmediato.
  const panelTipoServicio = document.getElementById(`panel-tipo-servicio-${id}`);
  if (panelTipoServicio) panelTipoServicio.focus();
}

/* Cierra el panel sin guardar nada. */
function cancelarPanelMantenimiento() {
  idVehiculoEnMantenimiento = null;
  renderizarTabla();
}

/* Lee los datos del panel, los valida DENTRO de la web (sin window.prompt/alert)
   y, si son correctos, actualiza el vehículo. Este es también el lugar que
   arregla el bug de "aceptar sin datos": antes, un costo vacío se convertía
   en Number('') = 0, que pasaba la validación (0 no es < 0) y quedaba
   guardado como si el mantenimiento no hubiera costado nada. Ahora se exige
   explícitamente un valor. */
function confirmarPanelMantenimiento(id) {
  const vehiculo = flota.find(v => v.id === id);
  if (!vehiculo) return;

  const panelTipoServicio = document.getElementById(`panel-tipo-servicio-${id}`);
  const panelCosto = document.getElementById(`panel-costo-${id}`);
  const panelError = document.getElementById(`panel-error-${id}`);

  const tipoServicio = panelTipoServicio.value;
  const textoCosto = panelCosto.value.trim();
  const nuevoCosto = Number(textoCosto);

  // REQUERIMIENTO 17/18: se valida y se avisa DENTRO del panel, antes de guardar cualquier dato
  if (tipoServicio === '') {
    panelError.textContent = 'Selecciona el tipo de servicio realizado.';
    return;
  }
  if (textoCosto === '' || isNaN(nuevoCosto) || nuevoCosto < 0) {
    panelError.textContent = 'Ingresa un costo válido (0 o más).';
    return;
  }

  flota = flota.map(v => {
    if (v.id !== id) return v;
    // Copiamos todas las propiedades del vehículo (spread) y solo
    // sobreescribimos las que cambian con este mantenimiento.
    return {
      ...v,
      kmMantenimiento: v.kmActual,
      fechaMantenimiento: new Date().toISOString().slice(0, 10),
      tipoServicio: tipoServicio,
      costoUltimoMantenimiento: nuevoCosto,
      costoTotalInvertido: v.costoTotalInvertido + nuevoCosto // suma al acumulado del vehículo
    };
  });

  idVehiculoEnMantenimiento = null;
  guardarEnAlmacenamiento();
  renderizarTodo();
  mostrarMensajeFormulario(`Mantenimiento de ${vehiculo.placa} registrado. Costo: S/ ${nuevoCosto.toFixed(2)}`, 'exito');
}

function obtenerFlotaOrdenadaPorUrgencia() {
  const ordenPrioridad = { 'Urgente': 0, 'Próximo': 1, 'Dato inválido': 2, 'Al día': 3 };
  // Spread para NO mutar el arreglo original "flota" al ordenar
  return [...flota].sort((a, b) => {
    const estadoA = calcularEstado(
      calcularDiagnostico(a).kmRecorridos,
      calcularDiagnostico(a).mesesTranscurridos
    );
    const estadoB = calcularEstado(
      calcularDiagnostico(b).kmRecorridos,
      calcularDiagnostico(b).mesesTranscurridos
    );
    return ordenPrioridad[estadoA] - ordenPrioridad[estadoB];
  });
}


/* =====================================================================
   REQUERIMIENTO 11 — ARREGLOS (operaciones sobre el arreglo)
   =====================================================================
   Combina filter() (por texto y por estado) para decidir qué filas se
   muestran en la tabla, según lo que el usuario escribió/seleccionó.   */
function obtenerFlotaFiltrada() {
  const base = ordenarPorUrgencia ? obtenerFlotaOrdenadaPorUrgencia() : flota;

  return base.filter(vehiculo => {
    // includes(): verifica que la placa contenga el texto buscado
    const coincideTexto = vehiculo.placa
      .toLowerCase()
      .includes(filtroTextoActual.toLowerCase());

    if (!coincideTexto) return false; // ! (negación lógica)

    if (filtroEstadoActual === 'todos') return true;

    const diagnostico = calcularDiagnostico(vehiculo);
    const estado = calcularEstado(diagnostico.kmRecorridos, diagnostico.mesesTranscurridos);
    return estado === filtroEstadoActual; // ===
  });
}


/* =====================================================================
   REQUERIMIENTO 9 — INTERPOLACIÓN (template literals)
   REQUERIMIENTO 15 — MANIPULACIÓN DEL DOM (innerHTML)
   =====================================================================
   Construye el HTML de UNA fila de la tabla usando template literals
   (backticks), interpolando los datos ya calculados del vehículo.      */
function crearFilaHTML(vehiculo) {
  const diagnostico = calcularDiagnostico(vehiculo);
  const estado = calcularEstado(diagnostico.kmRecorridos, diagnostico.mesesTranscurridos);
  const claseEstado = estado.replace(' ', '-').replace('í', 'i'); // "Al día" -> "Al-dia" (para CSS)
  const panelAbierto = idVehiculoEnMantenimiento === vehiculo.id;

  const filaPrincipal = `
    <tr>
      <td>${vehiculo.placa}</td>
      <td>${vehiculo.tipo}</td>
      <td>${vehiculo.tipoServicio || '—'}</td>
      <td>${formatearKilometraje(diagnostico.kmRecorridos)}</td>
      <td>${diagnostico.vidaUtilRestante}%</td>
      <td><span class="estado-etiqueta ${claseEstado}">${estado}</span></td>
      <td>S/ ${vehiculo.costoUltimoMantenimiento.toFixed(2)}</td>
      <td>
        <button type="button" class="boton-eliminar" data-accion="${panelAbierto ? 'cancelar-mantenimiento' : 'mantenimiento'}" data-id="${vehiculo.id}">
          ${panelAbierto ? 'Cancelar' : 'Marcar mantenimiento'}
        </button>
        <button type="button" class="boton-eliminar" data-accion="eliminar" data-id="${vehiculo.id}">
          Eliminar
        </button>
      </td>
    </tr>
  `;

  // Panel inline: solo se agrega cuando este vehículo es el que está en
  // edición. Aparece como una fila extra DENTRO de la misma tabla (no en
  // una ventana emergente), justo debajo del vehículo correspondiente.
  const filaPanel = panelAbierto ? `
    <tr class="fila-panel-mantenimiento">
      <td colspan="8">
        <div class="panel-mantenimiento">
          <strong>Registrar mantenimiento de ${vehiculo.placa}</strong>
          <div class="panel-mantenimiento__campos">
            <div class="campo">
              <label for="panel-tipo-servicio-${vehiculo.id}">Tipo de servicio</label>
              <select id="panel-tipo-servicio-${vehiculo.id}">
                <option value="" selected>Selecciona un tipo</option>
                ${TIPOS_SERVICIO.map(tipo => `<option value="${tipo}">${tipo}</option>`).join('')}
              </select>
            </div>
            <div class="campo">
              <label for="panel-costo-${vehiculo.id}">Costo (S/)</label>
              <input type="number" id="panel-costo-${vehiculo.id}" min="0" step="0.01" placeholder="Ej: 200.00">
            </div>
            <div class="panel-mantenimiento__acciones">
              <button type="button" class="boton boton--primario" data-accion="confirmar-mantenimiento" data-id="${vehiculo.id}">Confirmar</button>
              <button type="button" class="boton boton--secundario" data-accion="cancelar-mantenimiento" data-id="${vehiculo.id}">Cancelar</button>
            </div>
          </div>
          <span class="campo__error" id="panel-error-${vehiculo.id}"></span>
        </div>
      </td>
    </tr>
  ` : '';

  return filaPrincipal + filaPanel;
}


/* =====================================================================
   REQUERIMIENTO 15 — MANIPULACIÓN DEL DOM (innerHTML, classList, textContent)
   =====================================================================
   Vuelve a dibujar la tabla completa a partir del arreglo filtrado.    */
function renderizarTabla() {
  const flotaFiltrada = obtenerFlotaFiltrada();

  // map() + join(): arma un solo bloque de HTML con todas las filas
  cuerpoTabla.innerHTML = flotaFiltrada.map(crearFilaHTML).join('');

  // Mostrar/ocultar el mensaje de "tabla vacía" según corresponda
  const hayResultados = flotaFiltrada.length > 0;
  tablaVacia.style.display = hayResultados ? 'none' : 'block';
  tablaVacia.textContent = flota.length === 0
    ? 'Aún no registras vehículos. Usa el formulario de arriba para comenzar.'
    : 'Ningún vehículo coincide con la búsqueda/filtro actual.';
}


/* =====================================================================
   REQUERIMIENTO 15 — MANIPULACIÓN DEL DOM (textContent en los indicadores)
   =====================================================================
   Recalcula los contadores del tablero superior usando reduce().       */
function renderizarIndicadores() {
  const resumen = flota.reduce((contadores, vehiculo) => {
    const diagnostico = calcularDiagnostico(vehiculo);
    const estado = calcularEstado(diagnostico.kmRecorridos, diagnostico.mesesTranscurridos);

    if (estado === 'Urgente') contadores.urgente++;
    else if (estado === 'Próximo') contadores.proximo++;
    else if (estado === 'Al día') contadores.ok++;

    return contadores;
  }, { urgente: 0, proximo: 0, ok: 0 });

  indTotal.textContent = flota.length;
  indUrgente.textContent = resumen.urgente;
  indProximo.textContent = resumen.proximo;
  indOk.textContent = resumen.ok;

  // reduce(): suma el costo acumulado de TODOS los vehículos -> costo total de la flota
  const costoTotal = flota.reduce((acumulado, vehiculo) => acumulado + vehiculo.costoTotalInvertido, 0);
  // Operador ternario + comparación (>): evita dividir entre cero cuando la flota está vacía
  const costoPromedio = flota.length > 0 ? costoTotal / flota.length : 0;

  // Math.max / Math.min sobre el costo total invertido por cada vehículo
  const costosPorVehiculo = flota.map(vehiculo => vehiculo.costoTotalInvertido);
  const costoMaximo = flota.length > 0 ? Math.max(...costosPorVehiculo) : 0;
  const costoMinimo = flota.length > 0 ? Math.min(...costosPorVehiculo) : 0;

  indCostoTotal.textContent = `S/ ${costoTotal.toFixed(2)}`;
  indCostoPromedio.textContent = `S/ ${costoPromedio.toFixed(2)}`;
  indCostoMaximo.textContent = `S/ ${costoMaximo.toFixed(2)}`;
  indCostoMinimo.textContent = `S/ ${costoMinimo.toFixed(2)}`;
}

function renderizarTodo() {
  renderizarTabla();
  renderizarIndicadores();
}


/* =====================================================================
   REQUERIMIENTO 14 — EVENTOS (submit)
   =====================================================================
   Captura el envío del formulario, valida y, si todo está correcto,
   registra el nuevo vehículo en el arreglo "flota".                    */
formulario.addEventListener('submit', function (evento) {
  evento.preventDefault(); // evita que la página se recargue

  const datos = {
    placa: normalizarPlaca(inputPlaca.value),
    tipo: inputTipo.value,
    kmActual: Number(inputKmActual.value),
    kmMantenimiento: Number(inputKmMantenimiento.value),
    fechaMantenimiento: inputFechaMantenimiento.value,
    tipoServicio: inputTipoServicio.value,
    costo: Number(inputCosto.value),
    observaciones: inputObservaciones.value.trim()
  };

  const errores = validarDatosFormulario(datos);

  // Mostrar/limpiar el error específico de placa junto al campo
  errorPlaca.textContent = errores.find(e => e.includes('placa')) || '';

  if (errores.length > 0) {
    // join(): une todos los mensajes de error en un solo texto legible
    mostrarMensajeFormulario(`No se pudo registrar: ${errores.join(' ')}`, 'error');
    return;
  }

  const nuevoVehiculo = crearVehiculo(datos);
  flota.push(nuevoVehiculo); // REQUERIMIENTO 11: operación sobre el arreglo

  guardarEnAlmacenamiento();
  renderizarTodo();

  mostrarMensajeFormulario(`Vehículo ${nuevoVehiculo.placa} registrado correctamente.`, 'exito');
  formulario.reset();
});


/* =====================================================================
   REQUERIMIENTO 14 — EVENTOS (input, change, click)
   ===================================================================== */

// Evento "input": se dispara con cada letra que el usuario escribe (búsqueda en vivo)
inputBuscarPlaca.addEventListener('input', function (evento) {
  filtroTextoActual = evento.target.value;
  renderizarTabla();
});

// Evento "input" en la placa: convierte a mayúsculas mientras el usuario escribe
inputPlaca.addEventListener('input', function (evento) {
  evento.target.value = evento.target.value.toUpperCase();
});

// Evento "change": se dispara cuando el usuario elige otra opción del <select>
selectFiltroEstado.addEventListener('change', function (evento) {
  filtroEstadoActual = evento.target.value;
  renderizarTabla();
});

// Evento "click" en el botón de orden
botonOrdenar.addEventListener('click', function () {
  ordenarPorUrgencia = !ordenarPorUrgencia; // ! invierte el interruptor
  botonOrdenar.textContent = ordenarPorUrgencia
    ? 'Quitar orden por urgencia'
    : 'Ordenar por más urgente';
  renderizarTabla();
});

/* Evento "click" delegado: en vez de poner un listener en cada botón de
   la tabla (que se recrea todo el tiempo), escuchamos los clics en el
   <tbody> y revisamos en qué botón se hizo clic. */
cuerpoTabla.addEventListener('click', function (evento) {
  const boton = evento.target.closest('button[data-accion]');
  if (!boton) return;

  const id = Number(boton.dataset.id);
  const accion = boton.dataset.accion;

  if (accion === 'eliminar') {
    // filter(): crea un nuevo arreglo SIN el vehículo eliminado
    flota = flota.filter(vehiculo => vehiculo.id !== id);
    if (idVehiculoEnMantenimiento === id) idVehiculoEnMantenimiento = null;
    guardarEnAlmacenamiento();
    renderizarTodo();
    mostrarMensajeFormulario('Vehículo eliminado de la flota.', 'exito');
  } else if (accion === 'mantenimiento') {
    abrirPanelMantenimiento(id);
  } else if (accion === 'cancelar-mantenimiento') {
    cancelarPanelMantenimiento();
  } else if (accion === 'confirmar-mantenimiento') {
    confirmarPanelMantenimiento(id);
  }
});


/* =====================================================================
   INICIALIZACIÓN DE LA APLICACIÓN
   =====================================================================
   Al cargar la página: se recupera la flota guardada (si existe) y se
   dibuja la interfaz por primera vez.                                  */
function inicializarApp() {
  flota = cargarDesdeAlmacenamiento();
  renderizarTodo();
}

inicializarApp();