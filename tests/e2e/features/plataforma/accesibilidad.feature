# language: es
@plataforma @accesibilidad @solo-lectura
Característica: Accesibilidad de las páginas públicas
  Las páginas públicas no tienen infracciones graves ni críticas de axe (WCAG 2.2 AA).

  @FE-05
  Esquema del escenario: Las páginas públicas pasan axe sin infracciones graves
    Cuando abro la página "<ruta>"
    Entonces axe no encuentra infracciones graves ni críticas

    Ejemplos:
      | ruta         |
      | /privacidad  |
      | /condiciones |

  @FE-05
  Escenario: La portada pasa axe con el diseño de reserva aprobado
    Cuando abro la página "/"
    Entonces axe no encuentra infracciones graves ni críticas

  # La propuesta de reserva aprobada usa rosa oscuro y texto con contraste AA.
  # Se conserva este escenario específico como puerta de regresión para la paleta.
  @FE-05
  Escenario: La paleta de la portada cumple el contraste de WCAG AA
    Cuando abro la página "/"
    Entonces axe no encuentra infracciones de contraste
