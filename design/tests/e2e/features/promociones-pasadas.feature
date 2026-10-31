# language: es
@promociones @archivo @solo-web
Característica: Consultar las promociones históricas

  Escenario: El archivo muestra los precios, descuentos y mecánicas anteriores
    Dado que abro directamente "/tratamientos/promociones/"
    Entonces veo las promociones pasadas con sus condiciones
    Y las promociones pasadas no ofrecen contratar la oferta

  Escenario: El archivo permanece visible después del Buen Fin
    Dado que la fecha de la clínica es "2026-11-18"
    Y que abro directamente "/tratamientos/promociones/"
    Entonces veo las promociones pasadas con sus condiciones
    Y la promoción Reset Praná aparece como "vencida"

  Escenario: El archivo permite consultar el tratamiento sin recuperar la oferta
    Dado que abro directamente "/tratamientos/promociones/"
    Cuando consulto la carboxiterapia desde el archivo
    Entonces veo la página de "Corporales" en "/tratamientos/corporales/#carboxiterapia"

  Escenario: Las ofertas históricas no se anuncian en inicio
    Dado que abro el catálogo de Praná
    Entonces no aparece el archivo de promociones en inicio
