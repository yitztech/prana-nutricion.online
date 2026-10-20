# language: es
@contacto @solo-lectura
Característica: Formulario de contacto por WhatsApp
  El formulario no envía nada al servidor: abre WhatsApp con el mensaje ya escrito.

  @smoke
  Escenario: Un mensaje completo abre WhatsApp con todos los datos
    Dado que abro el formulario de contacto
    Cuando escribo "Ana María López" en el campo "Nombre completo"
    Y escribo "+52 777 123 4567" en el campo "Teléfono"
    Y elijo el servicio "Cuidado de la Piel"
    Y escribo "¿Tienen citas el sábado? Precio & horario" en el campo "Mensaje"
    Y pulso "Agendar Valoración"
    Entonces se abre WhatsApp al "527772095094" con un mensaje que incluye:
      | *Nombre:* Ana María López                              |
      | *Teléfono:* +52 777 123 4567                           |
      | *Servicio de Interés:* Cuidado de la Piel              |
      | *Mensaje:* ¿Tienen citas el sábado? Precio & horario   |
    Y veo el aviso "Abrimos WhatsApp con tu mensaje. Solo falta que lo envíes desde allí."

  @validacion
  Escenario: Sin datos no se abre WhatsApp y cada campo explica qué falta
    Dado que abro el formulario de contacto
    Cuando pulso "Agendar Valoración"
    Entonces no se abre WhatsApp
    Y el campo "Nombre completo" explica "Escribe tu nombre."
    Y el campo "Teléfono" explica "Escribe tu teléfono."
    Y el campo "Mensaje" explica "Escribe tu mensaje."

  @validacion @FE-11
  Esquema del escenario: Los campos descartan los caracteres que no les corresponden
    Dado que abro el formulario de contacto
    Cuando escribo "<escrito>" en el campo "<campo>"
    Entonces el campo "<campo>" contiene "<queda>"
    Y el campo "<campo>" explica "<aviso>"

    Ejemplos:
      | campo           | escrito        | queda      | aviso                                 |
      | Nombre completo | Ana123 Ma_ría  | Ana María  | El nombre solo admite letras          |
      | Teléfono        | 777abc209#5094 | 7772095094 | El teléfono solo admite números       |

  @validacion @FE-11
  Escenario: Un teléfono con pocos dígitos no se acepta
    Dado que abro el formulario de contacto
    Cuando escribo "Ana" en el campo "Nombre completo"
    Y escribo "777 12" en el campo "Teléfono"
    Y escribo "Hola" en el campo "Mensaje"
    Y pulso "Agendar Valoración"
    Entonces no se abre WhatsApp
    Y el campo "Teléfono" explica "El teléfono debe tener entre 8 y 15 dígitos."

  @limites @FE-12
  Escenario: El mensaje muestra cuánto queda
    Dado que abro el formulario de contacto
    Cuando escribo "Hola" en el campo "Mensaje"
    Entonces el contador del mensaje dice "4 / 2000"

  @limites @FE-12
  Escenario: Pegar un nombre demasiado largo avisa del límite
    Dado que abro el formulario de contacto
    Cuando pego un texto de 60 caracteres en el campo "Nombre completo"
    Entonces el campo "Nombre completo" explica "Máximo 50 caracteres"

  Escenario: «Saber más» de un servicio lo deja elegido en el formulario
    Dado que abro la página "/"
    Cuando pulso «Saber más» del servicio "Recuperación Postoperatoria"
    Entonces el servicio elegido es "Recuperación Postoperatoria"
