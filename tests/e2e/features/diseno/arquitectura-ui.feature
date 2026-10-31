# language: es
@arquitectura @solo-web
Característica: Conservar el tema elegido y consultar el catálogo por páginas

  # Antes se probaban dos controles en una página de prueba que solo existía con el servidor de
  # desarrollo de Vite. La página publicada tiene un control: se comparte la elección entre pestañas.
  @tema @smoke
  Escenario: La elección del tema se conserva al recargar
    Dado que abro la página "/"
    Cuando elijo el modo oscuro
    Entonces la página está en modo oscuro
    Y la elección se conserva al recargar
    Cuando elijo el modo claro
    Entonces la página está en modo claro

  @tema
  Escenario: La preferencia del sistema se sigue hasta que la persona elige
    Dado que abro la página "/"
    Cuando el sistema cambia a modo oscuro
    Entonces la página está en modo oscuro
    Cuando elijo el modo claro
    Y el sistema vuelve a cambiar de claro a oscuro
    Entonces la página está en modo claro

  @tema @limites
  Escenario: La elección dura la visita aunque el almacenamiento esté bloqueado
    Dado que el navegador bloquea el almacenamiento
    Y que abro la página "/"
    Cuando elijo el modo oscuro
    Entonces la página está en modo oscuro
    Cuando el sistema cambia a modo oscuro
    Y el sistema cambia a modo claro
    Entonces la página está en modo oscuro

  @tema
  Escenario: Otra pestaña comunica su elección y la retirada de la preferencia
    Dado que abro la página "/"
    Cuando elijo el modo oscuro en otra pestaña
    Entonces la página está en modo oscuro
    Cuando retiro la preferencia desde la otra pestaña
    Entonces la página está en modo claro

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
