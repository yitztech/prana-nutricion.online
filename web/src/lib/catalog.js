export const categories = [
  { id: 'reductivos', title: 'Tratamientos reductivos', image: 'postop', description: 'Opciones de cuidado corporal para conversar durante tu valoración.', services: [
    { slug: 'mini-lipo', title: 'Mini Lipo', description: 'Una opción de tratamiento corporal. En tu valoración puedes conocer cómo se realiza en Prana y resolver tus dudas.' },
    { slug: 'lipolaser', title: 'Lipoláser', description: 'Tratamiento estético que utiliza tecnología láser para el cuidado corporal. Consulta con el equipo si es adecuado para tus objetivos.' },
    { slug: 'cavitacion', title: 'Cavitación', description: 'Tratamiento de aparatología estética que utiliza ultrasonido para el cuidado corporal. El equipo puede explicarte sus características en una valoración.' },
    { slug: 'aparatologia-corporal', title: 'Aparatología corporal', description: 'Tecnologías de cuidado estético corporal que pueden formar parte de un plan personalizado, según tu valoración.' },
  ] },
  { id: 'corporales', title: 'Tratamientos corporales', image: 'skincare', description: 'Conoce alternativas de cuidado corporal y recibe orientación personalizada.', services: [
    { slug: 'carboxiterapia', title: 'Carboxiterapia', description: 'Tratamiento que utiliza dióxido de carbono en aplicaciones localizadas. Consulta con el equipo cómo se realiza y si es apropiado para ti.' },
    { slug: 'mesoterapia', title: 'Mesoterapia', description: 'Tratamiento que consiste en aplicaciones localizadas. En una valoración podrás conocer sus características y consultar tus dudas.' },
  ] },
  { id: 'depilacion-laser', title: 'Depilación láser', image: 'skincare', description: 'Conoce las opciones de depilación láser disponibles para distintas zonas.', services: [
    { slug: 'depilacion-cuerpo-completo', title: 'Cuerpo completo', description: 'Depilación láser para cuerpo completo. Consulta con Prana las zonas incluidas y los detalles del tratamiento.' },
    { slug: 'depilacion-bikini-completo', title: 'Bikini completo', description: 'Depilación láser para bikini completo. El equipo puede orientarte sobre el tratamiento durante tu valoración.' },
  ] },
  { id: 'paquetes', title: 'Paquetes y promociones', image: 'hero', description: 'Explora opciones de tratamientos y consulta su disponibilidad actual.', services: [
    { slug: 'reset-prana', title: 'Reset Praná', description: 'Consulta con el equipo qué incluye Reset Praná y su disponibilidad actual.' },
    { slug: 'reductivo-intenso', title: 'Tratamiento reductivo intenso', description: 'Una opción de cuidado corporal. Pregunta al equipo por sus características y disponibilidad.' },
    { slug: 'paquete-carboxiterapia', title: 'Paquete de carboxiterapia', description: 'Consulta los detalles y la disponibilidad actual de esta opción de carboxiterapia.' },
    { slug: 'tratamientos-combinados', title: 'Tratamientos combinados', description: 'Opciones que combinan tratamientos de acuerdo con una valoración. Consulta con Prana las alternativas disponibles.' },
  ] },
];
export const servicePath = (service) => `/servicio-${service.slug}`;
