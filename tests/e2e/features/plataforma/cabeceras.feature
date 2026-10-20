# language: es
@plataforma @seguridad @solo-lectura
Característica: Cabeceras de seguridad y recursos propios
  El gateway pone las cabeceras de seguridad, y la web no carga nada de terceros: fuentes, iconos
  e imágenes se sirven desde el propio dominio.

  @smoke @SEG-04
  Esquema del escenario: Las páginas llevan las cabeceras de seguridad
    Cuando abro la página "<ruta>"
    Entonces la página lleva las cabeceras de seguridad
    Y la política de contenido solo permite scripts del propio dominio y de la analítica

    Ejemplos:
      | ruta         |
      | /            |
      | /privacidad  |
      | /condiciones |

  @SEG-04
  Escenario: La portada no carga recursos de otros dominios
    Dado que abro la página "/"
    Entonces la página no carga nada de otros dominios salvo la analítica
    Y la consola no muestra errores
