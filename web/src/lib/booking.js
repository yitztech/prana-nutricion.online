const WHATSAPP_NUMBER = "527772095094";

export function bookingUrl(service) {
  const message = service
    ? `¡Hola Prana! Quisiera agendar una valoración de ${service}. ¿Qué horarios tienen disponibles?`
    : "¡Hola Prana! Quisiera agendar una valoración. ¿Qué horarios tienen disponibles?";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
