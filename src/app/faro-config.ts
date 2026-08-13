export interface MeetingConfig {
  status: string;
  title: string;
  description: string;
  schedule: string;
  facebookUrl: string;
  nearestUrl: string;
  onlineUrl: string;
  onlineLabel: string;
}

export interface LiveConfig {
  enabled: boolean;
  startsAt: string;
  endsAt: string;
  label: string;
  titleTop: string;
  titleAccent: string;
  description: string;
  url: string;
  buttonLabel: string;
  embedUrl: string;
}

export interface MusicPlatform {
  name: string;
  url: string;
}

export interface MusicRelease {
  title: string;
  artist: string;
  eyebrow: string;
  coverImage: string;
  platforms: MusicPlatform[];
}

export interface CalendarEvent {
  date: string;
  title: string;
  time: string;
  location: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
}

export interface FaroConfig {
  site: {
    name: string;
    description: string;
    canonicalUrl: string;
  };

  api: {
    enabled: boolean;
    url: string;
    refreshMs: number;
  };

  meeting: MeetingConfig;
  live: LiveConfig;

  music: {
    enabled: boolean;
    releases: MusicRelease[];
  };

  newsletter: {
    enabled: boolean;
    buttondownUsername: string;
    actionUrl: string;
    tag: string;
  };

  calendar: {
    enabled: boolean;
    title: string;
    subtitle: string;

    // Se conserva únicamente como fallback.
    // La fuente principal ahora es Google Calendar mediante FARO Web API.
    events: CalendarEvent[];
  };

  socials: Record<string, string>;
  firstVisit: [string, string][];

  photos: {
    hero: string;
    worship: string;
    people: string;
    prayer: string;
    footer: string;
  };
}

export const FARO_CONFIG: FaroConfig = {
  site: {
    name: 'Comunidad F.A.R.O.',
    description: 'Fe, Amor, Relevancia y Obediencia. Una familia, muchas tribus.',
    canonicalUrl: 'https://TU-DOMINIO-AQUI/'
  },

  /*
   * FUENTE DINÁMICA DE LA WEB
   *
   * Angular consulta este endpoint automáticamente.
   * Los horarios, próximos eventos y transmisiones LIVE
   * dejan de depender de cambios manuales en el código.
   */
  api: {
    enabled: true,
    url: 'https://script.google.com/macros/s/AKfycbwAC0pJrqevZMBgXSis6qQRlw4s3h9ARQtBR2KizHZMmojnwZ3WxJL60KJKzfeXReIw/exec',
    refreshMs: 30000
  },

  meeting: {
    status: 'CONFIRMAR EN REDES',
    title: 'La próxima convocatoria.',
    description: 'Revisa la publicación más reciente para confirmar el punto, la reunión en casas o el acceso en línea.',
    schedule: 'Consulta la convocatoria vigente',
    facebookUrl: 'https://www.facebook.com/comunidad.FARO/',
    nearestUrl: 'https://www.facebook.com/comunidad.FARO/',
    onlineUrl: '',
    onlineLabel: 'Entrar a la transmisión'
  },

  /*
   * FALLBACK MANUAL.
   *
   * Normalmente estos campos quedan vacíos porque Google Calendar
   * controla el LIVE. Si algún día la API falla, todavía puedes usar
   * enabled / startsAt / endsAt / url manualmente.
   */
  live: {
    enabled: false,
    startsAt: '',
    endsAt: '',
    label: 'TRANSMISIÓN EN VIVO',
    titleTop: 'ESTAMOS',
    titleAccent: 'EN VIVO.',
    description: 'Conéctate desde donde estés.',
    url: '',
    buttonLabel: 'Entrar a la transmisión',
    embedUrl: ''
  },

  music: {
    enabled: true,
    releases: [
      {
        title: 'El Dios Que Gobierna',
        artist: 'A. Mendoza',
        eyebrow: 'YA DISPONIBLE',
        coverImage: 'assets/images/el-dios-que-gobierna.png',
        platforms: [
          { name: 'Spotify', url: 'https://open.spotify.com/intl-es/track/7BlZl5wsnxif6XalOeaTUa' },
          { name: 'YouTube Music', url: 'https://music.youtube.com/search?q=El%20Dios%20Que%20Gobierna%20A.%20Mendoza' },
          { name: 'Apple Music', url: 'https://music.apple.com/us/search?term=El%20Dios%20Que%20Gobierna%20A.%20Mendoza' },
          { name: 'Amazon Music', url: 'https://music.amazon.com/search/El%20Dios%20Que%20Gobierna%20A.%20Mendoza' },
          { name: 'Deezer', url: 'https://www.deezer.com/search/El%20Dios%20Que%20Gobierna%20A.%20Mendoza' },
          { name: 'TIDAL', url: 'https://tidal.com/search?q=El%20Dios%20Que%20Gobierna%20A.%20Mendoza' }
        ]
      }
    ]
  },

  newsletter: {
    enabled: true,
    buttondownUsername: '',
    actionUrl: '',
    tag: 'sitio-web'
  },

  calendar: {
    enabled: true,
    title: 'Calendario FARO',
    subtitle: 'Aparta estas fechas y sigue la convocatoria semanal para confirmar ubicacion o modalidad.',
    events: [
      {
        date: '2026-08-16',
        title: 'Reunion de domingo',
        time: '11:00',
        location: 'Por confirmar en redes',
        description: 'Celebracion principal de comunidad. Revisa la publicacion vigente antes de salir.',
        ctaLabel: 'Ver convocatoria',
        ctaUrl: 'https://www.facebook.com/comunidad.FARO/'
      },
      {
        date: '2026-08-20',
        title: 'Noche de oracion en casas',
        time: '20:00',
        location: 'Reuniones por zonas',
        description: 'Tiempo de oracion y comunidad en grupos cercanos.',
        ctaLabel: 'Preguntar punto cercano',
        ctaUrl: 'https://www.facebook.com/comunidad.FARO/'
      },
      {
        date: '2026-08-23',
        title: 'Domingo en Casa FARO',
        time: '11:00',
        location: 'Por confirmar en redes',
        description: 'Continuamos celebrando al Rey y viviendo el Reino como familia.',
        ctaLabel: 'Actualizarme por Facebook',
        ctaUrl: 'https://www.facebook.com/comunidad.FARO/'
      }
    ]
  },

  socials: {
    facebook: 'https://www.facebook.com/comunidad.FARO/',
    instagram: 'https://www.instagram.com/comunidad_faro/',
    youtube: '',
    whatsapp: ''
  },

  firstVisit: [
    ['¿Dónde se reúnen esta semana?', 'La ubicación puede cambiar. Revisa aquí la próxima fecha o la convocatoria vigente en nuestras redes.'],
    ['¿Y si la reunión es en casas?', 'Escríbenos desde el enlace Preguntar por la más cercana para conocer el punto que te conviene.'],
    ['¿Hay transmisión en vivo?', 'Cuando exista una transmisión activa, será lo primero que aparezca al entrar al sitio.'],
    ['¿Hay actividades para niños?', '[INFORMACIÓN POR CONFIRMAR]'],
    ['¿Necesito registrarme?', '[INFORMACIÓN POR CONFIRMAR]'],
    ['¿Hay código de vestimenta?', '[INFORMACIÓN POR CONFIRMAR]']
  ],

  photos: {
    hero: '',
    worship: '',
    people: '',
    prayer: '',
    footer: ''
  }
};
