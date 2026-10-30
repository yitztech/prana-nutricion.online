export const WHATSAPP_NUMBER = "527772095094";

/** Enlace a WhatsApp con el mensaje preparado. No confirma una cita: la clínica acuerda día y hora. */
export function bookingUrl(treatment?: string) {
  const message = treatment
    ? `¡Hola Praná! Quisiera agendar una valoración de ${treatment}. ¿Qué horarios tienen disponibles?`
    : "¡Hola Praná! Quisiera agendar una valoración. ¿Qué horarios tienen disponibles?";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
