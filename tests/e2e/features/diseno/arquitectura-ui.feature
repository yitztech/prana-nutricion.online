# language: es
@arquitectura @solo-web
Característica: Compartir el tema y conservar el catálogo al separar los módulos

  @tema @smoke
  Escenario: Dos controles comparten la elección y la conservan al volver
    Dado que abro una página con dos controles de tema
    Cuando elijo el modo oscuro desde el primer control
    Entonces ambos controles ofrecen cambiar a modo claro
    Y la elección se conserva al recargar
    Cuando elijo el modo claro desde el segundo control
    Entonces ambos controles ofrecen cambiar a modo oscuro

  @tema
  Escenario: La preferencia del sistema se sigue hasta que la persona elige
    Dado que abro una página con dos controles de tema
    Cuando el sistema cambia a modo oscuro
    Entonces ambos controles ofrecen cambiar a modo claro
    Cuando elijo el modo claro desde el segundo control
    Y el sistema vuelve a cambiar de claro a oscuro
    Entonces ambos controles ofrecen cambiar a modo oscuro

  @tema @limites
  Escenario: La elección sigue compartida cuando el almacenamiento está bloqueado
    Dado que el navegador bloquea el almacenamiento
    Y que abro una página con dos controles de tema
    Cuando elijo el modo oscuro desde el primer control
    Entonces ambos controles ofrecen cambiar a modo claro
    Cuando el sistema cambia a modo oscuro
    Y el sistema cambia a modo claro
    Entonces ambos controles ofrecen cambiar a modo claro

  @tema
  Escenario: Otra pestaña comunica su elección y la retirada de la preferencia
    Dado que abro una página con dos controles de tema
    Cuando elijo el modo oscuro en otra pestaña
    Entonces ambos controles ofrecen cambiar a modo claro
    Cuando retiro la preferencia desde la otra pestaña
    Entonces ambos controles ofrecen cambiar a modo oscuro

  @tratamientos @smoke
  Escenario: El catálogo abre una página y permite consultar sus tratamientos
    Dado que abro el catálogo de Praná
    Cuando consulto los tratamientos reductivos
    Entonces veo la ficha de Mini Lipo
    Cuando selecciono Cavitación
    Entonces veo la ficha de Cavitación
    Y puedo solicitar su valoración por WhatsApp
    Y la categoría se muestra en una página sin diálogo
    Entonces puedo consultar los tratamientos corporales desde el pie
