# language: es
@tratamientos @solo-web
Característica: Consultar las cuatro categorías en páginas independientes

  Escenario: Ver paquetes abre el mismo destino que el catálogo
    Dado que abro el catálogo de Praná
    Cuando consulto Ver paquetes desde las promociones
    Entonces veo la página de "Paquetes y promociones" en "/tratamientos/promociones/"

  Escenario: Promociones del menú principal abre su página
    Dado que abro el catálogo de Praná
    Cuando consulto Promociones desde el menú principal
    Entonces veo la página de "Paquetes y promociones" en "/tratamientos/promociones/"

  @smoke
  Esquema del escenario: Cada categoría tiene una página que admite recarga y regreso
    Dado que abro el catálogo de Praná
    Cuando consulto la categoría "<categoría>"
    Entonces veo la página de "<categoría>" en "<ruta>"
    Y puedo recargar y volver al catálogo

    Ejemplos:
      | categoría                | ruta                           |
      | Reductivos  | /tratamientos/reductivos/      |
      | Corporales  | /tratamientos/corporales/      |
      | Depilación láser         | /tratamientos/depilacion-laser/ |
      | Paquetes y promociones   | /tratamientos/promociones/     |

  Escenario: Un enlace directo abre el apartado de un tratamiento
    Dado que abro directamente "/tratamientos/reductivos/#cavitacion"
    Entonces veo el apartado de Cavitación y puedo regresar con el navegador

  Escenario: La navegación de la categoría regresa a las secciones de inicio
    Dado que abro directamente "/tratamientos/corporales/"
    Entonces la cabecera permite volver a contacto en inicio

  Escenario: Una categoría desconocida ofrece recuperación
    Dado que abro directamente "/tratamientos/no-existe/"
    Entonces veo una página no encontrada con regreso al catálogo

  Escenario: Los objetivos enlazan a las páginas de los tratamientos
    Dado que abro el catálogo de Praná
    Cuando consulto Cavitación desde los beneficios
    Entonces veo el apartado de Cavitación desde su objetivo
