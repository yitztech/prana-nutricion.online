# language: es
@objetivos @solo-web
Característica: Abrir una página desde cada icono de objetivos

  @smoke
  Esquema del escenario: Los cinco iconos tienen destino propio y tratamientos relacionados
    Dado que abro el catálogo de Praná
    Cuando consulto el objetivo "<objetivo>"
    Entonces veo el objetivo "<objetivo>" en "<ruta>" con <cantidad> tratamientos
    Y puedo volver a la franja de objetivos

    Ejemplos:
      | objetivo                     | ruta                                  | cantidad |
      | Reducción de medidas         | /beneficios/reduccion-medidas/         | 4        |
      | Mejora la circulación        | /beneficios/mejora-la-circulacion/     | 3        |
      | Moldea tu figura             | /beneficios/moldea-tu-figura/          | 3        |
      | Piel más firme y rejuvenecida | /beneficios/piel-mas-firme/            | 2        |
      | Bienestar integral           | /beneficios/bienestar-integral/        | 2        |

  Escenario: Los iconos permiten navegar con el teclado
    Dado que abro el catálogo de Praná
    Cuando abro Bienestar integral con el teclado
    Entonces veo la página de Bienestar integral

  Escenario: Un objetivo desconocido ofrece recuperación
    Dado que abro directamente "/beneficios/no-existe/"
    Entonces veo una página no encontrada con regreso al catálogo
