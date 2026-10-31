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
    Y la sección "Encuentra tu tratamiento" queda a la vista

  @FE-05
  Escenario: El menú se cierra con Escape y devuelve el foco
    Dado que abro la portada en un móvil
    Cuando abro el menú
    Y pulso Escape
    Entonces el menú se cierra
    Y el foco vuelve al botón del menú

  Escenario: El menú ofrece agendar la valoración
    Dado que abro la portada en un móvil
    Cuando abro el menú
    Entonces el menú ofrece agendar una valoración por WhatsApp
