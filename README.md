(Versión lanzable sujeta a cambios de la página web y con textos genéricos)
# WHITE HOLE — Portal de Contenido

Sitio web completo con tema cósmico, modo claro/oscuro, animaciones avanzadas, partículas, parallax, sidebar, carrusel arrastrable y modales.

## Estructura

```
white-hole/
├── index.html              # Inicio (agujero negro)
├── pages/
│   ├── novel.html          # Novela web
│   ├── library.html        # Biblioteca anime (carrusel)
│   └── discord.html        # Comunidad Discord
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   ├── home.css
│   │   ├── novel.css
│   │   ├── library.css
│   │   └── discord.css
│   ├── js/
│   │   ├── main.js
│   │   └── library.js
│   └── images/
│       ├── icons/          # SVG: sun, moon, discord, book
│       └── animes/         # Portadas (placeholders temáticos)
└── README.md
```

## Cómo usar

1. Extrae el RAR.
2. Abre `index.html` en un navegador moderno (Chrome, Firefox, Edge).
3. Navega con el menú lateral (botón hamburguesa).
4. Tema claro/oscuro en la esquina superior derecha.
5. En Biblioteca: arrastra el carrusel, haz clic en una ficha para el modal.

## Enlaces

- Novela: https://getinkspired.com/es/u/dakzan/
- Discord: https://discord.gg/J6RV8sxkGP

## Características

- Diseño oscuro profundo / pasteles claros (sin rosa)
- Partículas interactivas + orbes + aurora + grano
- Sidebar expandible (escritorio) / drawer móvil
- Carrusel con drag + momentum + tilt 3D
- Modal con blur y animaciones
- Totalmente responsive
- Iconos SVG (no emojis)
- Transiciones y micro-interacciones

Las portadas de anime son placeholders generados con el estilo del sitio. Sustitúyelas por imágenes reales de alta resolución manteniendo los nombres de archivo si lo deseas.


## Música de fondo

El sitio usa un reproductor **HTML5 nativo** (`assets/audio/bgm.mp3`).
- Sustituye ese archivo por tu pista (exportada desde YouTube u otra fuente) manteniendo el nombre `bgm.mp3`.
- El botón de volumen junto al tema activa/silencia la música.

## Capítulos de la novela

Edita la lista en `assets/js/novel.js` → objeto `ARCS`:
- `title`, `available`, `chapters: [{ num, title, url }]`
