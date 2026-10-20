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

    # Contraste de la paleta aprobada (2026-10-20): texto blanco sobre el rosa #D49CA8 (2,3:1) en los
    # botones y el panel de contacto, y el roseGold #D3A59D como texto (2,0:1). WCAG AA pide 4,5:1.
    # Cambiar esos colores es un cambio de diseño: espera la decisión del cliente.
    @pendiente
    Ejemplos:
      | ruta |
      | /    |
