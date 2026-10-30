# language: es
@menu @solo-lectura
Característica: Menú en el móvil

  @smoke
  Escenario: El menú lleva a la sección elegida y se cierra
    Dado que abro la portada en un móvil
    Cuando abro el menú
    Entonces veo el enlace "Tratamientos" en el menú
    Cuando elijo "Tratamientos" en el menú
    Entonces el menú se cierra
    Y la sección "¿Qué te gustaría cuidar?" queda a la vista

  @FE-05
  Escenario: El menú se cierra con Escape
    Dado que abro la portada en un móvil
    Cuando abro el menú
    Y pulso Escape
    Entonces el menú se cierra
