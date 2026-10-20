# language: es
@plataforma @solo-lectura @api
Característica: Salud y versión publicadas
  Uptime Kuma y el despliegue comprueban el sitio sin sesión ni datos internos.

  @smoke @DEP-05
  Escenario: El gateway responde a la comprobación de salud
    Cuando pido "/healthz"
    Entonces responde 200
    Y el cuerpo contiene "ok"

  @smoke @DEP-05 @DEP-11
  Escenario: La versión publicada indica la revisión desplegada
    Cuando pido "/version.json"
    Entonces responde 200
    Y la versión trae la revisión desplegada
