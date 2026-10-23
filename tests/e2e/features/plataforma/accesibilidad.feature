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
  Escenario: La portada pasa axe salvo la paleta pendiente de aprobación
    Cuando abro la página "/"
    Entonces axe no encuentra infracciones graves ni críticas salvo el contraste pendiente

  # Contraste de la paleta aprobada (2026-10-20): blanco sobre rosa #D49CA8 (2,3:1) y texto
  # roseGold #D3A59D (2,0:1). WCAG AA pide 4,5:1; cambiarla espera la decisión del cliente.
  @FE-05 @pendiente
  Escenario: La paleta de la portada cumple el contraste de WCAG AA
    Cuando abro la página "/"
    Entonces axe no encuentra infracciones de contraste
