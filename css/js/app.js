// ---------- Almacenamiento ----------
const leer = (clave) => JSON.parse(localStorage.getItem(clave) || "[]");
const guardar = (clave, datos) => localStorage.setItem(clave, JSON.stringify(datos));

// ---------- Utilidades de fecha y hora ----------
function fechaHoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function horaAhora() {
  return new Date().toLocaleTimeString("es-CO", { hour12: false });
}

// ---------- Elementos ----------
const inputLector = document.getElementById("inputLector");
const mensaje = document.getElementById("mensaje");
const filtroFecha = document.getElementById("filtroFecha");
filtroFecha.value = fechaHoy();

// ---------- Mensajes ----------
function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = `mensaje ${tipo}`;
  setTimeout(() => (mensaje.className = "mensaje"), 3500);
}

// ---------- Estudiantes ----------
function agregarEstudiante() {
  const codigo = document.getElementById("codigo").value.trim().toUpperCase();
  const nombre = document.getElementById("nombre").value.trim();
  const grado = document.getElementById("grado").value.trim();

  if (!codigo || !nombre) return alert("Código y nombre son obligatorios.");

  const estudiantes = leer("estudiantes");
  if (estudiantes.some(e => e.codigo === codigo)) return alert("Ese código ya existe.");

  estudiantes.push({ codigo, nombre, grado });
  guardar("estudiantes", estudiantes);

  ["codigo", "nombre", "grado"].forEach(id => (document.getElementById(id).value = ""));
  pintarEstudiantes();
}

function eliminarEstudiante(codigo) {
  guardar("estudiantes", leer("estudiantes").filter(e => e.codigo !== codigo));
  pintarEstudiantes();
}

function pintarEstudiantes() {
  const tbody = document.getElementById("tablaEstudiantes");
  tbody.innerHTML = "";
  leer("estudiantes").forEach(est => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${est.codigo}</td>
      <td>${est.nombre}</td>
      <td>${est.grado}</td>
      <td><div class="qr-mini" id="qr-${est.codigo}"></div></td>
      <td><button onclick="eliminarEstudiante('${est.codigo}')">Eliminar</button></td>`;
    tbody.appendChild(fila);

    // Generar el QR con el código del estudiante
    new QRCode(document.getElementById(`qr-${est.codigo}`), {
      text: est.codigo,
      width: 128,
      height: 128
    });
  });
}

// ---------- Asistencia ----------
function registrarAsistencia(codigo) {
  const est = leer("estudiantes").find(e => e.codigo === codigo);
  if (!est) return mostrarMensaje(`Código no reconocido: ${codigo}`, "error");

  const asistencias = leer("asistencias");
  const fecha = fechaHoy();

  if (asistencias.some(a => a.codigo === codigo && a.fecha === fecha)) {
    return mostrarMensaje(`${est.nombre} ya registró su ingreso hoy.`, "aviso");
  }

  const hora = horaAhora();
  asistencias.push({ codigo, nombre: est.nombre, fecha, hora });
  guardar("asistencias", asistencias);

  mostrarMensaje(`✔ ${est.nombre} — ingreso registrado a las ${hora}`, "ok");
  pintarAsistencia();
}

function pintarAsistencia() {
  const tbody = document.getElementById("tablaAsistencia");
  tbody.innerHTML = "";
  leer("asistencias")
    .filter(a => a.fecha === filtroFecha.value)
    .forEach(a => {
      tbody.innerHTML += `<tr><td>${a.codigo}</td><td>${a.nombre}</td><td>${a.fecha}</td><td>${a.hora}</td></tr>`;
    });
}

// ---------- Eventos ----------
document.getElementById("btnAgregar").addEventListener("click", agregarEstudiante);
filtroFecha.addEventListener("change", pintarAsistencia);

// El lector USB "escribe" el código y envía Enter
inputLector.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const codigo = inputLector.value.trim().toUpperCase();
    inputLector.value = "";
    if (codigo) registrarAsistencia(codigo);
  }
});

// Mantener el foco en el lector para que siempre reciba el escaneo
document.addEventListener("click", (e) => {
  if (!["INPUT", "BUTTON"].includes(e.target.tagName)) inputLector.focus();
});

// ---------- Inicio ----------
pintarEstudiantes();
pintarAsistencia();
