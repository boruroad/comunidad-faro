# Comunidad F.A.R.O. — sitio web

Sitio estático para Comunidad FARO, pensado para GitHub Pages.

## Qué versión es esta

Esta versión fusiona el diseño editorial de la propuesta inicial —hero de pantalla completa, tipografía grande, fotografía protagonista, contrastes oscuros y ritmo de revista— con la información vigente:

- FARO = **Fe · Amor · Relevancia · Obediencia**.
- No se publica una dirección fija si no está confirmada.
- La reunión puede ser en un punto presencial, en casas o en línea.
- La convocatoria vigente de redes tiene prioridad.
- Si existe una liga de Google Meet, puede mostrarse desde `js/config.js`.

La antigua sección amarilla fue eliminada. La paleta actual usa carbón, marfil y tonos piedra para que el color principal venga de las fotografías y artes reales de FARO.

## Cómo verla en tu computadora

1. Descomprime el ZIP.
2. Entra a la carpeta `faro-site`.
3. En Windows, haz clic en la barra donde aparece la ruta de la carpeta, escribe `cmd` y presiona Enter.
4. Ejecuta:

```bash
python -m http.server 8000
```

Si no reconoce `python`, prueba:

```bash
py -m http.server 8000
```

5. Abre Chrome y entra a:

```text
http://localhost:8000
```

## Cómo cambiar la próxima reunión

Abre `js/config.js`.

Dentro de `meeting` puedes cambiar:

- `status`: estado de la convocatoria.
- `title`: título principal.
- `description`: explicación breve.
- `schedule`: horario confirmado.
- `facebookUrl`: enlace a la convocatoria o a la página.
- `nearestUrl`: enlace para preguntar por la reunión/casa más cercana.
- `meetUrl`: liga de Google Meet.

Si `meetUrl` está vacío, el botón de Meet no aparece.

Ejemplo:

```js
meetUrl: "https://meet.google.com/xxx-xxxx-xxx"
```

## Cómo agregar fotografías reales

Guarda las fotos dentro de:

```text
assets/images/
```

Por ejemplo:

```text
assets/images/hero.jpg
assets/images/reunion.jpg
assets/images/personas.jpg
assets/images/oracion.jpg
assets/images/footer.jpg
```

Luego abre `js/config.js` y cambia:

```js
photos: {
  hero: "assets/images/hero.jpg",
  worship: "assets/images/reunion.jpg",
  people: "assets/images/personas.jpg",
  prayer: "assets/images/oracion.jpg",
  footer: "assets/images/footer.jpg"
}
```

Mientras esos campos estén vacíos, el sitio usa fondos editoriales neutros en lugar de stock.

## Cómo cambiar redes sociales

En `js/config.js`, modifica `socials`.

Si un dato todavía no está confirmado, puedes dejar:

```text
[INFORMACIÓN POR CONFIRMAR]
```

El enlace no se mostrará.

## Cómo subir a GitHub

1. Entra a GitHub.
2. Crea un repositorio nuevo, por ejemplo `comunidad-faro`.
3. Selecciona `Add file` → `Upload files`.
4. Sube **el contenido de esta carpeta**, incluyendo `index.html`, `css/`, `js/`, `assets/`, etc.
5. Haz `Commit changes`.

La raíz del repositorio debe verse así:

```text
comunidad-faro/
├── index.html
├── 404.html
├── css/
├── js/
├── assets/
├── data/
├── favicon/
├── robots.txt
└── sitemap.xml
```

## Activar GitHub Pages

1. En el repositorio entra a `Settings`.
2. Abre `Pages`.
3. En `Source`, selecciona `Deploy from a branch`.
4. Branch: `main`.
5. Folder: `/ (root)`.
6. Pulsa `Save`.

GitHub generará una dirección similar a:

```text
https://TU-USUARIO.github.io/comunidad-faro/
```

## Dominio propio más adelante

Cuando tengan dominio, en GitHub Pages puedes agregarlo en `Custom domain`. Después habrá que actualizar `canonicalUrl`, `canonical`, Open Graph, `robots.txt` y `sitemap.xml` con la URL definitiva.
