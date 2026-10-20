# language: es
@plataforma @legal @solo-lectura
Característica: Páginas legales
  La web tiene formulario y analítica: publica su aviso de privacidad y sus condiciones de uso.

  @WEB-02
  Esquema del escenario: El aviso de privacidad y las condiciones se publican
    Cuando abro la página "<ruta>"
    Entonces la página responde 200 con el título principal "<titulo>"
    Y la página está en "es"
    Y el enlace canonical apunta a "https://prana-nutricion.online<ruta>"

    Ejemplos:
      | ruta         | titulo              |
      | /privacidad  | Aviso de privacidad |
      | /condiciones | Condiciones de uso  |

  Escenario: Una página que no existe responde 404 con una página propia
    Cuando abro la página "/no-existe"
    Entonces la página responde 404 con el título principal "Página no encontrada"
