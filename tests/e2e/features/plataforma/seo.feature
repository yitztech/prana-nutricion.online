# language: es
@plataforma @seo @solo-lectura
Característica: Buscadores y redes sociales

  @smoke @WEB-04
  Escenario: La portada tiene título, descripción y canonical
    Dado que abro la página "/"
    Entonces la página está en "es"
    Y el título de la pestaña empieza por "Prana & Nutrición"
    Y la página tiene descripción
    Y el enlace canonical apunta a "https://prana-nutricion.online/"

  @WEB-04
  Escenario: Los buscadores encuentran el robots.txt y el sitemap
    Cuando pido "/robots.txt"
    Entonces responde 200
    Y el cuerpo contiene "Sitemap: https://prana-nutricion.online/sitemap.xml"
    Cuando pido "/sitemap.xml"
    Entonces responde 200
    Y el cuerpo contiene "<loc>https://prana-nutricion.online/privacidad</loc>"
