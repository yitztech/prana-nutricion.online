# language: es
@contacto @solo-lectura
Característica: Formulario de contacto por WhatsApp
  El formulario no envía nada al servidor: abre WhatsApp con el mensaje ya escrito.

  @smoke
  Escenario: Un mensaje completo prepara WhatsApp y conserva todos los datos
    Dado que abro el formulario de contacto
    Cuando escribo "Ana María López" en el campo "Nombre completo"
    Y escribo "+52 777 123 4567" en el campo "Teléfono"
    Y elijo el servicio "Cuidado de la Piel"
    Y escribo "¿Tienen citas el sábado? Precio & horario" en el campo "Mensaje"
    Y pulso "Agendar Valoración"
    Entonces se intenta abrir WhatsApp al "527772095094" con un mensaje que incluye:
      | *Nombre:* Ana María López                              |
      | *Teléfono:* +52 777 123 4567                           |
      | *Servicio de Interés:* Cuidado de la Piel              |
      | *Mensaje:* ¿Tienen citas el sábado? Precio & horario   |
    Y veo el aviso "Tu mensaje está listo. Si WhatsApp no se abrió, usa «Continuar en WhatsApp». Envíalo desde allí."
    Y puedo continuar con el mismo mensaje en WhatsApp
    Y el campo "Nombre completo" contiene "Ana María López"
    Y el campo "Teléfono" contiene "+52 777 123 4567"
    Y el servicio elegido es "Cuidado de la Piel"
    Y el campo "Mensaje" contiene "¿Tienen citas el sábado? Precio & horario"
    Cuando escribo " por favor" en el campo "Mensaje"
    Entonces no aparece el enlace para continuar en WhatsApp

  Escenario: Si se bloquea la ventana, el mensaje sigue disponible para continuar
    Dado que abro el formulario con las ventanas emergentes bloqueadas
    Cuando escribo "Ana" en el campo "Nombre completo"
    Y escribo "7772095094" en el campo "Teléfono"
    Y escribo "Hola" en el campo "Mensaje"
    Y pulso "Agendar Valoración"
    Entonces puedo continuar con el mismo mensaje en WhatsApp
    Y el campo "Nombre completo" contiene "Ana"
    Y el campo "Teléfono" contiene "7772095094"
    Y el campo "Mensaje" contiene "Hola"
    Y el contador del mensaje dice "4 / 2000"
    Y veo el aviso "Tu mensaje está listo. Si WhatsApp no se abrió, usa «Continuar en WhatsApp». Envíalo desde allí."

  Escenario: Si falla la apertura, puedo recuperar el mensaje
    Dado que abro el formulario de contacto
    Y que el navegador falla al intentar abrir WhatsApp
    Cuando escribo "Ana" en el campo "Nombre completo"
    Y escribo "7772095094" en el campo "Teléfono"
    Y escribo "Hola" en el campo "Mensaje"
    Y pulso "Agendar Valoración"
    Entonces hay un enlace para continuar en WhatsApp
    Y el campo "Mensaje" contiene "Hola"
    Y veo el aviso "No pudimos abrir WhatsApp. Usa «Continuar en WhatsApp» para enviar tu mensaje."

  Escenario: Preparar dos veces el mismo mensaje evita ventanas duplicadas
    Dado que abro el formulario de contacto
    Cuando escribo "Ana" en el campo "Nombre completo"
    Y escribo "7772095094" en el campo "Teléfono"
    Y escribo "Hola" en el campo "Mensaje"
    Y pulso "Agendar Valoración"
    Y pulso "Agendar Valoración"
    Entonces solo se intenta abrir una ventana de WhatsApp
    Y puedo continuar con el mismo mensaje en WhatsApp

  @validacion
  Escenario: Sin datos no se abre WhatsApp y cada campo explica qué falta
    Dado que abro el formulario de contacto
    Cuando pulso "Agendar Valoración"
    Entonces no se abre WhatsApp
    Y no aparece el enlace para continuar en WhatsApp
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
    Y el campo "Nombre completo" tiene 50 caracteres

  @limites @FE-12
  Escenario: El límite de pegado tiene en cuenta la selección reemplazada
    Dado que abro el formulario de contacto
    Cuando pego un texto de 50 caracteres en el campo "Nombre completo"
    Y selecciono "aaaaaaaaaa" del campo "Nombre completo"
    Y pego "María" en el campo "Nombre completo"
    Entonces el campo "Nombre completo" contiene "Maríaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    Y el campo "Nombre completo" tiene 45 caracteres
    Y el campo "Nombre completo" no tiene errores

  @limites @FE-12
  Escenario: Pegar un mensaje demasiado largo conserva el texto previo y avisa
    Dado que abro el formulario de contacto
    Cuando escribo "Hola " en el campo "Mensaje"
    Y pego un texto de 2000 caracteres en el campo "Mensaje"
    Entonces el campo "Mensaje" explica "Máximo 2000 caracteres"
    Y el campo "Mensaje" tiene 2000 caracteres
    Y el campo "Mensaje" empieza por "Hola "
    Y el contador del mensaje dice "2000 / 2000"

  @validacion @FE-11
  Esquema del escenario: El pegado inserta texto y filtra caracteres inválidos
    Dado que abro el formulario de contacto
    Cuando pego "<texto>" en el campo "<campo>"
    Entonces el campo "<campo>" contiene "<queda>"
    Y el campo "<campo>" explica "<aviso>"

    Ejemplos:
      | campo           | texto          | queda      | aviso                           |
      | Nombre completo | Ana123 Ma_ría  | Ana María  | El nombre solo admite letras    |
      | Teléfono        | 777abc209#5094 | 7772095094 | El teléfono solo admite números |

  Escenario: «Saber más» de un servicio lo deja elegido en el formulario
    Dado que abro la página "/"
    Cuando pulso «Saber más» del servicio "Recuperación Postoperatoria"
    Entonces el servicio elegido es "Recuperación Postoperatoria"
