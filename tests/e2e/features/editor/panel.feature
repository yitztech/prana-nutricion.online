# language: es
@editor
Característica: Editar el sitio desde el panel
  Quien administra el sitio entra en admin.prana-nutricion.online con su correo y edita los
  tratamientos, las promociones y los textos legales. Cada cambio se publica solo en el sitio.
  Cada escenario usa su propia cuenta y sus propios datos, y deja el contenido como estaba.

  @acceso
  Escenario: Sin sesión, el panel pide entrar
    Cuando abro el editor en "/promociones"
    Entonces veo la pantalla para entrar

  @acceso @validacion
  Escenario: Un correo o una contraseña incorrectos no abren sesión
    Dado que tengo una cuenta del editor
    Cuando entro al editor con una contraseña equivocada
    Entonces el editor avisa "El correo o la contraseña no son correctos."

  @acceso @smoke
  Escenario: Entrar y cerrar sesión
    Dado que tengo una cuenta del editor
    Cuando entro al editor
    Entonces veo el inicio del editor con mi nombre
    Cuando cierro la sesión
    Entonces veo la pantalla para entrar

  @acceso
  Escenario: Restablecer la contraseña con el enlace del correo
    Dado que tengo una cuenta del editor
    Cuando pido un enlace para restablecer mi contraseña
    Y abro el enlace del correo y elijo una contraseña nueva
    Entonces puedo entrar con la contraseña nueva

  @cuenta
  Escenario: Cambiar la contraseña desde la cuenta
    Dado que entré al editor
    Cuando cambio mi contraseña
    Y cierro la sesión
    Entonces puedo entrar con la contraseña nueva

  @tratamientos
  Escenario: Añadir, editar y borrar un tratamiento
    Dado que entré al editor
    Cuando añado un tratamiento a la categoría "Corporales"
    Entonces el tratamiento aparece en su página del sitio
    Cuando cambio la descripción del tratamiento
    Entonces la descripción nueva aparece en su página del sitio
    Cuando borro el tratamiento
    Entonces el tratamiento desaparece de su página del sitio

  @tratamientos @validacion
  Escenario: Una categoría no se guarda con el título vacío
    Dado que entré al editor
    Cuando dejo vacío el título de la categoría "Reductivos" y la guardo
    Entonces el campo "Título" avisa "Este campo es obligatorio."

  @promociones
  Escenario: Crear una promoción con una imagen propia, verla en la portada y borrarla
    Dado que entré al editor
    Cuando creo una promoción visible con una imagen subida
    Entonces la promoción aparece en la portada del sitio
    Cuando borro la promoción
    Entonces la promoción desaparece de la portada del sitio

  @promociones @validacion
  Escenario: Una promoción visible necesita su último día y una imagen
    Dado que entré al editor
    Cuando intento crear una promoción solo con el nombre
    Entonces el campo "Último día" avisa "Indica el último día de la promoción."
    Y el editor avisa "Sube una imagen o elige una foto del sitio."

  @legal
  Escenario: El aviso de privacidad se edita con su formato
    Dado que entré al editor
    Cuando abro el documento "Aviso de privacidad"
    Entonces veo su texto con la barra de formato
    Cuando dejo vacío su título y lo guardo
    Entonces el campo "Título" avisa "Este campo es obligatorio."
