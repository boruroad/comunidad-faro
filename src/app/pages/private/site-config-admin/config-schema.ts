// Metadatos que describen la forma de FaroConfig para renderizar un editor
// de tablas de propiedades en vez de una caja de texto con JSON crudo.
// Cada campo indica como debe dibujarse y como generar una fila nueva vacia
// cuando el usuario agrega un elemento a una lista (moments, releases, etc).

export type ConfigFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'url'
  | 'object'
  | 'list'
  | 'map'
  | 'tuple-list';

export interface ConfigFieldSchema {
  key: string;
  label: string;
  type: ConfigFieldType;
  placeholder?: string;
  // 'object': forma fija de un sub-objeto (ej. meeting, live, calendar).
  objectSchema?: ConfigFieldSchema[];
  // 'list': forma de cada elemento del arreglo (ej. un evento de calendario).
  itemSchema?: ConfigFieldSchema[];
  // 'list': propiedad del item a mostrar como titulo de la fila/tarjeta.
  itemLabelKey?: string;
  // 'map': etiquetas de columnas para Record<string, string> (ej. socials).
  mapKeyLabel?: string;
  mapValueLabel?: string;
  // 'tuple-list': etiquetas de columnas para arreglos de pares (ej. firstVisit).
  tupleLabels?: [string, string];
}

const CALENDAR_EVENT_SCHEMA: ConfigFieldSchema[] = [
  { key: 'date', label: 'Fecha', type: 'text', placeholder: 'YYYY-MM-DD' },
  { key: 'title', label: 'Titulo', type: 'text' },
  { key: 'time', label: 'Hora', type: 'text', placeholder: 'HH:MM' },
  { key: 'location', label: 'Ubicacion', type: 'text' },
  { key: 'description', label: 'Descripcion', type: 'textarea' },
  { key: 'ctaLabel', label: 'Texto del boton', type: 'text' },
  { key: 'ctaUrl', label: 'URL del boton', type: 'url' }
];

const MOMENT_ITEM_SCHEMA: ConfigFieldSchema[] = [
  { key: 'id', label: 'ID', type: 'text' },
  { key: 'tag', label: 'Etiqueta', type: 'text' },
  { key: 'title', label: 'Titulo', type: 'text' },
  { key: 'caption', label: 'Descripcion', type: 'textarea' },
  { key: 'image', label: 'Imagen (ruta)', type: 'text' },
  { key: 'alt', label: 'Texto alternativo', type: 'text' },
  { key: 'aspectClass', label: 'Clase de proporcion', type: 'text' }
];

const MUSIC_PLATFORM_SCHEMA: ConfigFieldSchema[] = [
  { key: 'name', label: 'Plataforma', type: 'text' },
  { key: 'url', label: 'URL', type: 'url' }
];

const MUSIC_RELEASE_SCHEMA: ConfigFieldSchema[] = [
  { key: 'title', label: 'Titulo', type: 'text' },
  { key: 'artist', label: 'Artista', type: 'text' },
  { key: 'eyebrow', label: 'Etiqueta superior', type: 'text' },
  { key: 'duration', label: 'Duracion', type: 'text' },
  { key: 'coverImage', label: 'Portada (ruta)', type: 'text' },
  { key: 'spotifyTrackId', label: 'Spotify Track ID', type: 'text' },
  {
    key: 'platforms',
    label: 'Plataformas',
    type: 'list',
    itemSchema: MUSIC_PLATFORM_SCHEMA,
    itemLabelKey: 'name'
  }
];

const SERMON_SCHEMA: ConfigFieldSchema[] = [
  { key: 'id', label: 'ID', type: 'text' },
  { key: 'title', label: 'Titulo', type: 'text' },
  { key: 'series', label: 'Serie', type: 'text' },
  { key: 'date', label: 'Fecha', type: 'text' },
  { key: 'preacher', label: 'Predicador', type: 'text' },
  { key: 'thumbnail', label: 'Miniatura (ruta)', type: 'text' },
  { key: 'thumbnailAlt', label: 'Alt de miniatura', type: 'text' },
  { key: 'driveUrl', label: 'URL de Drive', type: 'url' },
  { key: 'featured', label: 'Destacado', type: 'boolean' }
];

const CLIP_SCHEMA: ConfigFieldSchema[] = [
  { key: 'id', label: 'ID', type: 'text' },
  { key: 'title', label: 'Titulo', type: 'text' },
  { key: 'series', label: 'Serie', type: 'text' },
  { key: 'date', label: 'Fecha', type: 'text' },
  { key: 'duration', label: 'Duracion', type: 'text' },
  { key: 'posterUrl', label: 'Poster (ruta)', type: 'text' },
  { key: 'videoUrl', label: 'Video (ruta)', type: 'text' },
  { key: 'driveFolderUrl', label: 'URL carpeta Drive', type: 'url' }
];

export const CONFIG_SCHEMA: ConfigFieldSchema[] = [
  {
    key: 'site',
    label: 'Sitio',
    type: 'object',
    objectSchema: [
      { key: 'name', label: 'Nombre', type: 'text' },
      { key: 'canonicalUrl', label: 'URL canonica', type: 'url' },
      { key: 'description', label: 'Descripcion', type: 'textarea' }
    ]
  },
  {
    key: 'meeting',
    label: 'Reunion',
    type: 'object',
    objectSchema: [
      { key: 'title', label: 'Titulo', type: 'text' },
      { key: 'description', label: 'Descripcion', type: 'textarea' },
      { key: 'status', label: 'Estado', type: 'text' },
      { key: 'schedule', label: 'Horario', type: 'text' },
      { key: 'facebookUrl', label: 'URL de Facebook', type: 'url' },
      { key: 'onlineUrl', label: 'URL de transmision', type: 'url' },
      { key: 'onlineLabel', label: 'Texto del boton de transmision', type: 'text' },
      { key: 'nearestUrl', label: 'URL "punto mas cercano"', type: 'url' }
    ]
  },
  {
    key: 'live',
    label: 'Transmision en vivo (respaldo manual)',
    type: 'object',
    objectSchema: [
      { key: 'enabled', label: 'Activada', type: 'boolean' },
      { key: 'label', label: 'Etiqueta', type: 'text' },
      { key: 'titleTop', label: 'Titulo (linea superior)', type: 'text' },
      { key: 'titleAccent', label: 'Titulo (acento)', type: 'text' },
      { key: 'description', label: 'Descripcion', type: 'textarea' },
      { key: 'buttonLabel', label: 'Texto del boton', type: 'text' },
      { key: 'url', label: 'URL de transmision', type: 'url' },
      { key: 'embedUrl', label: 'URL embebida', type: 'url' },
      { key: 'startsAt', label: 'Inicia (ISO)', type: 'text' },
      { key: 'endsAt', label: 'Termina (ISO)', type: 'text' }
    ]
  },
  {
    key: 'calendar',
    label: 'Calendario',
    type: 'object',
    objectSchema: [
      { key: 'enabled', label: 'Activado', type: 'boolean' },
      { key: 'title', label: 'Titulo', type: 'text' },
      { key: 'subtitle', label: 'Subtitulo', type: 'textarea' },
      {
        key: 'events',
        label: 'Eventos',
        type: 'list',
        itemSchema: CALENDAR_EVENT_SCHEMA,
        itemLabelKey: 'title'
      }
    ]
  },
  {
    key: 'moments',
    label: 'Momentos de casa',
    type: 'object',
    objectSchema: [
      { key: 'eyebrow', label: 'Etiqueta superior', type: 'text' },
      { key: 'title', label: 'Titulo', type: 'text' },
      { key: 'subtitle', label: 'Subtitulo', type: 'text' },
      {
        key: 'items',
        label: 'Momentos',
        type: 'list',
        itemSchema: MOMENT_ITEM_SCHEMA,
        itemLabelKey: 'title'
      }
    ]
  },
  {
    key: 'music',
    label: 'Musica',
    type: 'object',
    objectSchema: [
      { key: 'enabled', label: 'Activado', type: 'boolean' },
      { key: 'artistSpotifyUrl', label: 'URL de artista en Spotify', type: 'url' },
      {
        key: 'releases',
        label: 'Lanzamientos',
        type: 'list',
        itemSchema: MUSIC_RELEASE_SCHEMA,
        itemLabelKey: 'title'
      }
    ]
  },
  {
    key: 'sermons',
    label: 'Predicas',
    type: 'object',
    objectSchema: [
      { key: 'enabled', label: 'Activado', type: 'boolean' },
      { key: 'title', label: 'Titulo', type: 'text' },
      { key: 'subtitle', label: 'Subtitulo', type: 'textarea' },
      { key: 'featured', label: 'Predica destacada', type: 'object', objectSchema: SERMON_SCHEMA },
      {
        key: 'list',
        label: 'Lista de predicas',
        type: 'list',
        itemSchema: SERMON_SCHEMA,
        itemLabelKey: 'title'
      }
    ]
  },
  {
    key: 'clips',
    label: 'Reels y clips',
    type: 'object',
    objectSchema: [
      { key: 'enabled', label: 'Activado', type: 'boolean' },
      { key: 'title', label: 'Titulo', type: 'text' },
      { key: 'subtitle', label: 'Subtitulo', type: 'textarea' },
      {
        key: 'items',
        label: 'Clips',
        type: 'list',
        itemSchema: CLIP_SCHEMA,
        itemLabelKey: 'title'
      }
    ]
  },
  {
    key: 'newsletter',
    label: 'Newsletter',
    type: 'object',
    objectSchema: [
      { key: 'enabled', label: 'Activado', type: 'boolean' },
      { key: 'buttondownUsername', label: 'Usuario de Buttondown', type: 'text' },
      { key: 'actionUrl', label: 'URL de accion del formulario', type: 'url' },
      { key: 'tag', label: 'Etiqueta', type: 'text' }
    ]
  },
  {
    key: 'socials',
    label: 'Redes sociales',
    type: 'map',
    mapKeyLabel: 'Red social',
    mapValueLabel: 'URL'
  },
  {
    key: 'firstVisit',
    label: 'Preguntas frecuentes (primera visita)',
    type: 'tuple-list',
    tupleLabels: ['Pregunta', 'Respuesta']
  },
  {
    key: 'photos',
    label: 'Fotografias',
    type: 'object',
    objectSchema: [
      { key: 'hero', label: 'Hero', type: 'text' },
      { key: 'worship', label: 'Alabanza', type: 'text' },
      { key: 'people', label: 'Personas', type: 'text' },
      { key: 'prayer', label: 'Oracion', type: 'text' },
      { key: 'footer', label: 'Footer', type: 'text' }
    ]
  },
  {
    key: 'api',
    label: 'API externa (Google Calendar/Sheets)',
    type: 'object',
    objectSchema: [
      { key: 'enabled', label: 'Activada', type: 'boolean' },
      { key: 'url', label: 'URL', type: 'url' },
      { key: 'refreshMs', label: 'Intervalo de refresco (ms)', type: 'number' }
    ]
  }
];

// Genera un objeto vacio que respeta la forma de un schema, usado al
// agregar una fila nueva a una lista (ej. "Agregar momento").
export function createEmptyItem(schema: ConfigFieldSchema[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const field of schema) {
    result[field.key] = emptyValueFor(field);
  }

  return result;
}

function emptyValueFor(field: ConfigFieldSchema): unknown {
  switch (field.type) {
    case 'boolean':
      return false;
    case 'number':
      return 0;
    case 'list':
      return [];
    case 'map':
      return {};
    case 'tuple-list':
      return [];
    case 'object':
      return field.objectSchema ? createEmptyItem(field.objectSchema) : {};
    default:
      return '';
  }
}
