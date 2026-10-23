# Propuesta para corregir el contraste

**Estado:** propuesta para revisar; no cambia la web ni sus colores actuales.

## Diagnóstico

Medí los colores del tema en `web/src/styles.css` con la fórmula de contraste sRGB de WCAG. La portada
no alcanza AA en los pares siguientes: el mínimo es 4.5:1 para texto normal y 3:1 para texto grande.

| Uso actual | Primer plano / fondo | Actual | Propuesta | Resultado |
| --- | --- | ---: | --- | ---: |
| Botones rosas con etiqueta blanca y panel de contacto | `#FFFFFF` / `#D49CA8` (`rose`) | 2.30:1 | `#2D2D2D` (`charcoal`) sobre `rose` | 5.98:1 |
| Botón al pasar el cursor y texto del distintivo | `#FFFFFF` / `#D3A59D` (`roseGold`) | 2.18:1 | `charcoal` sobre `roseGold` | 6.32:1 |
| Enlaces de servicios sobre sus tarjetas champagne | `#D3A59D` / `#FAF6F2` | 2.03:1 | `#A45549` (`roseGoldInk`) sobre champagne | 4.91:1 |
| Acento rosa dorado en la sección filosofía | `#D3A59D` / `#FBF2F0` (aprox. `blush/30`) | 1.98:1 | `roseGoldInk` sobre blush | 4.80:1 |
| Título de portada con gradiente rosa-dorado sobre champagne | extremos `#D49CA8` y `#C4A47C` / `#FAF6F2` | mínimo 2.14:1 | color sólido `roseInk: #A85063` sobre champagne | 4.89:1 |
| Iconos rosa sobre círculos blancos y acentos en hover | `#D49CA8` / `#FFFFFF` | 2.30:1 | `#A85063` (`roseInk`) sobre blanco | 5.26:1 |

El texto carbón ya está en el tema y conserva margen de contraste: 12.81:1 sobre champagne y 13.77:1
sobre blanco. La propuesta también mantiene más de 4.5:1 para los dos colores de acento oscurecidos sobre
blanco, champagne y la sección `blush/30`. El fondo bajo el rótulo del hero varía con la fotografía y el
gradiente; ese par requiere comprobación visual antes de escoger el color final.

## Recomendación

Mantener los rosas claros como fondos y decoración, y asignar los colores de primer plano según el fondo:

- En botones y paneles de `rose` o `roseGold`, usar texto e iconos carbón. Esto resuelve los botones y el
  panel de información de contacto sin oscurecer sus superficies.
- En texto o enlaces rosa sobre blanco o champagne, usar `roseInk: #A85063`.
- En texto o enlaces rosa dorado sobre blanco o champagne, usar `roseGoldInk: #A45549`.
- En el texto degradado del título, usar `roseInk` como color sólido y conservar la cursiva; da 4.89:1
  sobre champagne. El aspecto final bajo la foto del hero depende de la mezcla imagen-gradiente y debe
  revisarse en la captura.
- En la sección filosofía (`blush/30`), `roseGoldInk` alcanza 4.80:1 y mantiene el matiz cálido.
- Conservar `rose` y `roseGold` en fondos decorativos, formas y otros usos que no presenten texto encima.
- Mantener blanco sobre el fondo carbón existente. Para hover, foco y los estados de enlaces, verificar
  cada par de primer plano y fondo, y no depender solo del cambio de color para señalar una acción.

Esta opción corrige el texto del panel rosado y las etiquetas de botones. La principal diferencia visual
es que pasan de blanco a carbón sobre el rosa claro; la superficie rosa conserva su tono actual.

## Alternativa

Si se quiere conservar texto blanco en el botón principal o el panel de contacto, oscurecer solo esas
superficies. Un rosa de acción `#A85063` con blanco alcanza 5.26:1; un rosa dorado oscuro `#A45549`
con blanco alcanza 5.28:1. Las superficies decorativas y tarjetas pueden seguir usando los rosas claros.
Esta alternativa conserva las etiquetas blancas en las acciones destacadas, y oscurece de forma visible
el botón y el panel donde se aplique.

No recomiendo cambiar el rosa claro a un tono oscuro en todo el tema: eliminaría el fondo suave de otras
secciones aunque allí no haya texto encima.

## Alcance de implementación sugerido

1. Añadir los dos tokens de texto oscuro sin reemplazar los tokens actuales de superficie.
2. Aplicar `charcoal` al texto y los iconos sobre los fondos rosas claros; usar los tokens de acento en
   texto sobre superficies blancas o champagne. Cambiar el gradiente del título por `roseInk` y conservar
   la cursiva.
3. Revisar estados normal, hover, foco y activo en escritorio y móvil.
4. Mantener una comprobación axe para todas las reglas y otra para `color-contrast`. Retirar `@pendiente`
   solo cuando la portada completa pase ambas en todos los perfiles.

Antes de implementarla, conviene revisar una captura con los colores propuestos, especialmente el panel
de contacto y los dos botones rosas. Los ratios de esta propuesta se calcularon con los valores hex
indicados; no se han aplicado cambios de color ni se han vuelto a ejecutar las suites del sitio.
