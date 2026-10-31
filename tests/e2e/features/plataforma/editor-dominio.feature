# language: es
@plataforma @editor @seguridad
Característica: El editor vive en su propio dominio
  El panel y su API se sirven solo en el dominio del editor (admin.prana-nutricion.online): el sitio
  público no los expone, el panel no carga analítica ni se indexa, y la cookie de sesión es exclusiva
  del dominio del editor.

  @smoke @solo-lectura @SEG-04
  Esquema del escenario: El sitio público no sirve el editor
    Cuando abro la página "<ruta>"
    Entonces la página es el error 404 del sitio

    Ejemplos:
      | ruta               |
      | /admin             |
      | /admin/            |
      | /admin/restablecer |

  # Sin @smoke: el dominio del editor en producción depende del alta en infra-ionos-vps.
  @solo-lectura @SEG-04
  Esquema del escenario: El editor se abre en su dominio, sin analítica y fuera de los buscadores
    Cuando abro el editor en "<ruta>"
    Entonces la página lleva las cabeceras de seguridad
    Y el editor queda fuera de los buscadores y sin analítica
    Y el editor no carga nada de otros dominios
    Y la consola no muestra errores

    Ejemplos:
      | ruta         |
      | /            |
      | /restablecer |

  @sesion
  Escenario: La sesión del editor no llega al sitio público
    Dado que inicio sesión en el editor con una cuenta nueva
    Entonces el navegador guarda la sesión solo para el dominio del editor
    Y el sitio público no recibe la cookie de sesión
