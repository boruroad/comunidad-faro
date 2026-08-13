# Comunidad F.A.R.O. — sitio web

Sitio estático de Comunidad FARO. Funciona con HTML, CSS y JavaScript vanilla, así que puede publicarse en GitHub Pages sin servidor propio.

## 1. Ver la página en tu computadora

1. Descomprime la carpeta del proyecto.
2. Abre una terminal dentro de la carpeta `faro-site`.
3. Ejecuta:

```bash
python -m http.server 8000
```

En Windows también puedes probar:

```bash
py -m http.server 8000
```

4. Abre en el navegador:

```text
http://localhost:8000
```

No es recomendable abrir `index.html` sólo con doble clic.

---

## 2. Dónde cambiar la información semanal

Casi toda la información que cambia está en:

```text
js/config.js
```

Busca el bloque `meeting`:

```js
meeting: {
  status: "CONFIRMAR EN REDES",
  title: "Nos vemos en Casa.",
  description: "Revisa la publicación más reciente...",
  schedule: "Consulta la convocatoria vigente",
  facebookUrl: "https://www.facebook.com/comunidad.FARO/",
  nearestUrl: "https://www.facebook.com/comunidad.FARO/",
  onlineUrl: "",
  onlineLabel: "Entrar a la transmisión"
}
```

Si esa semana existe un acceso en línea, pega la liga en `onlineUrl`. Puede ser YouTube, Meet u otra plataforma. Si queda vacío, el botón desaparece.

---

## 3. Hacer que TRANSMISIÓN EN VIVO sea lo primero que se vea

En `js/config.js` busca:

```js
live: {
  enabled: false,
  startsAt: "",
  endsAt: "",
  label: "TRANSMISIÓN EN VIVO",
  titleTop: "ESTAMOS",
  titleAccent: "EN VIVO.",
  url: "",
  embedUrl: ""
}
```

### Opción fácil: encenderlo manualmente

Cambia:

```js
enabled: true
```

Y coloca el enlace de la transmisión, sin importar la plataforma:

```js
url: "https://..."
```

Mientras `enabled` sea `true`, el visitante verá primero una pantalla completa de **TRANSMISIÓN EN VIVO** con el acceso destacado.

Al terminar, vuelve a:

```js
enabled: false
```

### Opción automática por horario

Puedes dejar `enabled: false` y programar una ventana:

```js
startsAt: "2026-08-16T11:00:00-06:00",
endsAt: "2026-08-16T13:00:00-06:00"
```

Durante ese horario el modo EN VIVO aparecerá automáticamente.

### Video incrustado

Si la plataforma entrega una URL que permite `iframe`, colócala en `embedUrl`. Si no, deja `embedUrl` vacío y usa sólo el botón con `url`.

> El sitio no asume Facebook, YouTube ni Meet. Para la página siempre se trata simplemente de una **transmisión**.

---

## 4. Agregar o cambiar canciones

La sección **Música de Casa** también se administra desde `js/config.js`.

La primera canción ya está configurada:

```js
music: {
  enabled: true,
  releases: [
    {
      title: "El Dios Que Gobierna",
      artist: "A. Mendoza",
      eyebrow: "YA DISPONIBLE",
      coverImage: "",
      platforms: [
        { name: "Spotify", url: "..." },
        { name: "YouTube Music", url: "..." }
      ]
    }
  ]
}
```

### Para agregar otra canción

Copia el objeto completo de una canción y pégalo después, separado por coma:

```js
releases: [
  {
    title: "El Dios Que Gobierna",
    artist: "A. Mendoza",
    ...
  },
  {
    title: "NUEVA CANCIÓN",
    artist: "AUTOR",
    eyebrow: "YA DISPONIBLE",
    coverImage: "assets/images/portada-nueva.jpg",
    platforms: [
      { name: "Spotify", url: "https://..." },
      { name: "YouTube Music", url: "https://..." }
    ]
  }
]
```

`coverImage` es opcional. Si está vacío, el sitio genera una portada tipográfica que combina con FARO. Si tienen la portada oficial, guárdala en `assets/images/` y coloca su ruta.

---

## 5. Activar el newsletter

La sección del newsletter ya está diseñada. Para registrar correos se necesita un servicio externo porque GitHub Pages no guarda datos por sí solo.

El proyecto está preparado para **Buttondown**.

1. Crea el newsletter de Comunidad FARO en Buttondown.
2. Obtén el `username` de la cuenta/newsletter.
3. Abre `js/config.js`.
4. Busca:

```js
newsletter: {
  enabled: true,
  buttondownUsername: "",
  actionUrl: "",
  tag: "sitio-web"
}
```

5. Coloca el username:

```js
buttondownUsername: "comunidad-faro"
```

Si después usas otro proveedor, puedes dejar `buttondownUsername` vacío y pegar la URL POST del formulario en `actionUrl`.

> Antes de captar suscriptores, define quién administrará la lista de correos y completa el aviso de privacidad que corresponda a Comunidad FARO.

---

## 6. Cambiar fotografías

Guarda fotografías reales en:

```text
assets/images/
```

Después abre `js/config.js` y cambia:

```js
photos: {
  hero: "assets/images/hero-faro.jpg",
  worship: "assets/images/reunion.jpg",
  people: "assets/images/familia.jpg",
  prayer: "assets/images/oracion.jpg",
  footer: "assets/images/footer.jpg"
}
```

Si una foto queda vacía, el sitio muestra una composición tipográfica FARO en lugar de un cuadro roto.

---

## 7. Cambiar redes sociales

En `js/config.js`:

```js
socials: {
  facebook: "https://www.facebook.com/comunidad.FARO/",
  instagram: "https://www.instagram.com/comunidad_faro/",
  youtube: "",
  whatsapp: ""
}
```

Los campos vacíos no aparecen en la página.

---

## 8. Subir el sitio a GitHub

1. Crea un repositorio nuevo, por ejemplo `comunidad-faro`.
2. Descomprime este proyecto.
3. Sube **el contenido de `faro-site`**, no la carpeta externa completa.
4. En la raíz del repositorio debe verse `index.html`.
5. Haz `Commit changes`.

La estructura correcta es:

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

---

## 9. Activar GitHub Pages

En GitHub:

1. Entra al repositorio.
2. Abre **Settings**.
3. Entra a **Pages**.
4. En **Source**, elige `Deploy from a branch`.
5. Branch: `main`.
6. Folder: `/ (root)`.
7. Guarda.

GitHub publicará una URL similar a:

```text
https://TU-USUARIO.github.io/comunidad-faro/
```

---

## 10. Conectar un dominio propio después

Cuando exista un dominio propio, se configura desde **Settings → Pages → Custom domain**.

También cambia en `js/config.js`:

```js
canonicalUrl: "https://www.tudominio.mx/"
```

Y cambia el canonical/OG URL de `index.html`, `sitemap.xml` y `robots.txt` si corresponde.

---

## 11. Archivos que normalmente vas a tocar

Para el uso diario basta con estos:

```text
js/config.js       → reunión, transmisión, música, newsletter, redes y fotos
assets/images/     → fotografías y portadas musicales
```

No necesitas modificar el CSS o el HTML para actualizar una convocatoria, activar una transmisión o agregar una canción.
