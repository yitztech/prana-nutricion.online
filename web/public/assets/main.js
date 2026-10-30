// Comportamiento de la landing: navegación al hacer scroll, menú móvil y formulario de WhatsApp.
// Sin dependencias: lo que antes hacía Alpine.js desde un CDN.
'use strict';

// Límites y caracteres permitidos de la plataforma (AGENTS.md §6.2 y §6.3)
const LIMITES = { nombre: 50, telefono: 20, mensaje: 2000 };
const NO_NOMBRE = /[^\p{L}\p{M} '’.-]/gu;
const NO_TELEFONO = /[^0-9 ().+-]/g;
const NOMBRE_VALIDO = /^[\p{L}\p{M}](?:[\p{L}\p{M} '’.-]*[\p{L}\p{M}.])?$/u;
const TELEFONO_VALIDO = /^\+?[0-9 ().-]+$/;
const DIGITOS_TELEFONO = { min: 8, max: 15 };
const WHATSAPP_DESTINO = '527772095094';

const limpiar = (texto) => texto.trim().replace(/\s+/g, ' ');

function navegacion() {
  const nav = document.getElementById('navegacion');
  if (!nav) return;
  const actualizar = () => {
    const abajo = window.scrollY > 20;
    nav.classList.toggle('glass-effect', abajo);
    nav.classList.toggle('shadow-xs', abajo);
    nav.classList.toggle('bg-transparent', !abajo);
  };
  window.addEventListener('scroll', actualizar, { passive: true });
  actualizar();
}

function menuMovil() {
  const boton = document.getElementById('menu-boton');
  const menu = document.getElementById('menu-movil');
  if (!boton || !menu) return;
  const abrir = boton.querySelector('[data-menu-icono="abrir"]');
  const cerrar = boton.querySelector('[data-menu-icono="cerrar"]');

  const mostrar = (abierto) => {
    menu.hidden = !abierto;
    boton.setAttribute('aria-expanded', String(abierto));
    boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    abrir.hidden = abierto;
    cerrar.hidden = !abierto;
  };

  boton.addEventListener('click', () => mostrar(menu.hidden));
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) mostrar(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) {
      mostrar(false);
      boton.focus();
    }
  });
}

function formulario() {
  const form = document.getElementById('whatsapp-form');
  if (!form) return;
  const campos = {
    nombre: document.getElementById('wa-nombre'),
    telefono: document.getElementById('wa-telefono'),
    servicio: document.getElementById('wa-servicio'),
    mensaje: document.getElementById('wa-mensaje'),
  };
  const contador = document.getElementById('wa-mensaje-contador');
  const estado = document.getElementById('wa-estado');
  const continuar = document.getElementById('wa-continuar');

  // Un enlace preparado antes de editar dejaría de representar lo que hay en los campos.
  form.addEventListener('input', () => {
    continuar.hidden = true;
    continuar.removeAttribute('href');
    estado.textContent = '';
  });

  // origen: 'filtro' (carácter descartado, se queda a la vista) o 'validacion' (se borra al corregir)
  const error = (campo, texto, origen = 'validacion') => {
    const p = document.getElementById(`${campo.id}-error`);
    p.textContent = texto || '';
    p.hidden = !texto;
    campo.dataset.origenError = texto ? origen : '';
    campo.closest('[data-slot="field"]')?.setAttribute('data-invalid', String(Boolean(texto)));
    if (texto) campo.setAttribute('aria-invalid', 'true');
    else campo.removeAttribute('aria-invalid');
  };

  // Un carácter no permitido no entra en el campo, y se explica por qué
  const filtrar = (campo, prohibidos, aviso) => {
    campo.addEventListener('input', () => {
      const limpio = campo.value.replace(prohibidos, '');
      if (limpio !== campo.value) {
        campo.value = limpio;
        error(campo, aviso, 'filtro');
      } else if (campo.dataset.origenError === 'validacion' && campo.value.trim()) {
        error(campo, '');
      }
    });
  };
  filtrar(campos.nombre, NO_NOMBRE, 'El nombre solo admite letras, espacios, apóstrofo, guion y punto.');
  filtrar(campos.telefono, NO_TELEFONO, 'El teléfono solo admite números, espacios, guiones, puntos, paréntesis y + al principio.');

  // Lo pegado de más no se recorta en silencio: se avisa
  for (const [nombre, max] of Object.entries(LIMITES)) {
    const campo = campos[nombre];
    campo.addEventListener('paste', (e) => {
      const pegado = e.clipboardData?.getData('text') ?? '';
      const seleccion = campo.selectionEnd - campo.selectionStart;
      if (campo.value.length - seleccion + pegado.length > max) {
        setTimeout(() => error(campo, `Máximo ${max} caracteres: el texto pegado no cabe completo.`, 'filtro'));
      }
    });
  }

  const contar = () => {
    contador.textContent = `${campos.mensaje.value.length} / ${LIMITES.mensaje}`;
  };
  campos.mensaje.addEventListener('input', () => {
    contar();
    if (campos.mensaje.dataset.origenError === 'validacion' && campos.mensaje.value.trim()) error(campos.mensaje, '');
  });
  contar();

  // «Saber más» de cada servicio deja elegido ese servicio en el formulario
  document.querySelectorAll('[data-servicio]').forEach((enlace) => {
    enlace.addEventListener('click', () => {
      campos.servicio.value = enlace.dataset.servicio;
      campos.servicio.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });

  const validar = () => {
    const nombre = limpiar(campos.nombre.value);
    const telefono = limpiar(campos.telefono.value);
    const mensaje = campos.mensaje.value.trim();
    const digitos = telefono.replace(/\D/g, '').length;
    const errores = [];

    if (!nombre) errores.push([campos.nombre, 'Escribe tu nombre.']);
    else if (!NOMBRE_VALIDO.test(nombre)) errores.push([campos.nombre, 'El nombre solo admite letras, espacios, apóstrofo, guion y punto.']);
    else if (nombre.length > LIMITES.nombre) errores.push([campos.nombre, `Máximo ${LIMITES.nombre} caracteres.`]);

    if (!telefono) errores.push([campos.telefono, 'Escribe tu teléfono.']);
    else if (!TELEFONO_VALIDO.test(telefono) || digitos < DIGITOS_TELEFONO.min || digitos > DIGITOS_TELEFONO.max) {
      errores.push([campos.telefono, `El teléfono debe tener entre ${DIGITOS_TELEFONO.min} y ${DIGITOS_TELEFONO.max} dígitos.`]);
    } else if (telefono.length > LIMITES.telefono) errores.push([campos.telefono, `Máximo ${LIMITES.telefono} caracteres.`]);

    if (!mensaje) errores.push([campos.mensaje, 'Escribe tu mensaje.']);
    else if (mensaje.length > LIMITES.mensaje) errores.push([campos.mensaje, `Máximo ${LIMITES.mensaje} caracteres.`]);

    for (const campo of [campos.nombre, campos.telefono, campos.mensaje]) error(campo, '');
    for (const [campo, texto] of errores) error(campo, texto);
    return errores.length ? { campo: errores[0][0] } : { nombre, telefono, servicio: campos.servicio.value, mensaje };
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const datos = validar();
    if (datos.campo) {
      estado.textContent = 'Revisa los campos marcados.';
      datos.campo.focus();
      return;
    }

    // Texto plano: WhatsApp no interpreta HTML; encodeURIComponent evita que un & o un # corten el mensaje
    const texto = [
      '¡Hola Prana! Quisiera agendar una valoración.',
      '',
      `*Nombre:* ${datos.nombre}`,
      `*Teléfono:* ${datos.telefono}`,
      `*Servicio de Interés:* ${datos.servicio}`,
      `*Mensaje:* ${datos.mensaje}`,
    ].join('\n');
    const url = `https://wa.me/${WHATSAPP_DESTINO}?text=${encodeURIComponent(texto)}`;
    if (continuar.getAttribute('href') === url) {
      continuar.focus();
      return;
    }
    continuar.href = url;
    continuar.hidden = false;
    estado.textContent = 'Tu mensaje está listo. Si WhatsApp no se abrió, usa «Continuar en WhatsApp». Envíalo desde allí.';
    // Con noopener, null también puede indicar una apertura correcta. Conservamos siempre los datos.
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      estado.textContent = 'No pudimos abrir WhatsApp. Usa «Continuar en WhatsApp» para enviar tu mensaje.';
    }
  });
}

navegacion();
menuMovil();
formulario();
