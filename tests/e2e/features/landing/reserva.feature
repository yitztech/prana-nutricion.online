# language: es
@reserva @solo-lectura
Característica: Agendar una valoración sin completar el formulario
  WhatsApp prepara la conversación. La clínica confirma el día y la hora.

  @smoke
  Escenario: La primera pantalla permite agendar directamente
    Dado que abro la portada sin movimiento automático
    Entonces la primera pantalla ofrece agendar mi valoración
    Cuando abro la reserva de la primera pantalla
    Entonces WhatsApp prepara una valoración sin datos obligatorios

  Esquema del escenario: Cada tratamiento prepara su propia solicitud
    Dado que abro directamente "<página>"
    Cuando agendo una valoración de "<tratamiento>"
    Entonces WhatsApp prepara una valoración de "<tratamiento>"

    Ejemplos:
      | página                          | tratamiento     |
      | /tratamientos/reductivos/       | Mini Lipo       |
      | /tratamientos/corporales/       | Carboxiterapia  |
      | /tratamientos/depilacion-laser/ | Cuerpo completo |

  @FE-05 @FE-09
  Escenario: En móvil la reserva está disponible mientras recorro la página
    Dado que abro la portada en un móvil
    Entonces la barra de contacto rápido queda a la vista
    Cuando llego al final de la portada
    Entonces la barra de contacto rápido queda a la vista
    Y puedo acceder a los enlaces legales sin que la barra los cubra
    Cuando abro la reserva de la barra de contacto rápido
    Entonces WhatsApp prepara una valoración sin datos obligatorios

  Escenario: La reserva directa funciona sin el JavaScript de la página
    Dado que abro la portada sin su JavaScript
    Cuando abro la reserva de la primera pantalla
    Entonces WhatsApp prepara una valoración sin datos obligatorios

  @FE-09
  Esquema del escenario: La navegación y la reserva se adaptan a tabletas y escritorio
    Dado que abro la portada con un ancho de <ancho> píxeles
    Entonces la navegación y la reserva caben en la pantalla

    Ejemplos:
      | ancho |
      | 768   |
      | 834   |
      | 1024  |
      | 1440  |
