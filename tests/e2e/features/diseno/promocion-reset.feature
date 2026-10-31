# language: es
@promociones @solo-web
Característica: Mostrar Reset Praná con sus condiciones reales para el Buen Fin

  Escenario: La página de promociones presenta el paquete confirmado
    Dado que la fecha de la clínica es "2026-10-31"
    Y que abro directamente "/tratamientos/promociones/"
    Entonces veo Reset Praná con sus sesiones, precio y apartado
    Y puedo consultar la promoción por WhatsApp

  Esquema del escenario: La disponibilidad respeta la vigencia del Buen Fin
    Dado que la fecha de la clínica es "<fecha>"
    Y que abro directamente "/tratamientos/promociones/"
    Entonces la promoción Reset Praná aparece como "<estado>"

    Ejemplos:
      | fecha      | estado   |
      | 2026-11-12 | próxima  |
      | 2026-11-13 | vigente  |
      | 2026-11-17 | vigente  |
      | 2026-11-18 | vencida  |

  Escenario: Sin promociones vigentes se invita a preguntar por WhatsApp
    Dado que la fecha de la clínica es "2026-12-01"
    Y que abro directamente "/tratamientos/promociones/"
    Entonces no hay promociones vigentes y se invita a preguntar

  Escenario: Los tratamientos incluidos abren su página
    Dado que la fecha de la clínica es "2026-11-14"
    Y que abro directamente "/tratamientos/promociones/"
    Cuando consulto la aparatología incluida en Reset Praná
    Entonces veo el apartado de Aparatología corporal sin diálogo

  Escenario: La portada alterna con la promoción y se detiene al pulsarla
    Dado que la fecha de la clínica es "2026-11-14"
    Y que abro el catálogo de Praná
    Cuando pasa el tiempo de una diapositiva
    Entonces la portada muestra Reset Praná
    Cuando pulso la promoción de la portada
    Y pasa el tiempo de una diapositiva
    Entonces la portada sigue en Reset Praná con el carrusel detenido
