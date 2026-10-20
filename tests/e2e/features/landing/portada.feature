# language: es
@portada @solo-lectura
Característica: Portada

  @smoke @FE-08
  Escenario: Las imágenes de la portada cargan y se describen
    Dado que abro la página "/"
    Entonces todas las imágenes cargan y tienen texto alternativo

  @FE-09
  Escenario: La portada cabe en un móvil pequeño
    Dado que abro la página "/"
    Entonces no hay desplazamiento horizontal a 360 píxeles de ancho
