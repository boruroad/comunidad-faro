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
  spotifyTrackId?: string;
  duration?: string;
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

export interface HouseMoment {
  id: string;
  tag: string;
  title: string;
  caption: string;
  image: string;
  alt: string;
  aspectClass: string;
}

export interface FaroConfig {
  site: {
    name: string;
    description: string;
    canonicalUrl: string;
  };
  meeting: MeetingConfig;
  live: LiveConfig;
  moments: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: HouseMoment[];
  };
  music: {
    enabled: boolean;
    artistSpotifyUrl?: string;
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
  live: {
    enabled: false,
    startsAt: '',
    endsAt: '',
    label: 'TRANSMISIÓN EN VIVO',
    titleTop: 'ESTAMOS',
    titleAccent: 'EN VIVO.',
    description: 'Conéctate desde donde estés.',
    url: 'https://www.youtube.com/watch?v=ZuEz0U2F7Yg',
    buttonLabel: 'Entrar a la transmisión',
    embedUrl: ''
  },
  moments: {
    eyebrow: 'MOMENTOS DE CASA · VIDA EN COMUNIDAD',
    title: 'HAY UN LUGAR',
    subtitle: 'EN LA MESA.',
    items: [
      {
        id: '01',
        tag: 'VIDA EN CASA',
        title: 'Nuestra Casa',
        caption: 'Una familia abierta donde cada persona tiene un lugar para escuchar, crecer y pertenecer.',
        image: 'assets/images/faro-predicacion-to-the-family.webp',
        alt: 'Pastor compartiendo frente a la pared con el lema TO THE FAMILY CASA FARO',
        aspectClass: 'moment-tall'
      },
      {
        id: '02',
        tag: 'PERTENENCIA',
        title: 'Una familia, muchas tribus',
        caption: 'Amor fraterno que trasciende cualquier diferencia. El gozo de encontrarse semana a semana.',
        image: 'assets/images/faro-comunidad-abrazo-fraterno.webp',
        alt: 'Abrazo fraterno y sonrisa entre dos miembros de la comunidad',
        aspectClass: 'moment-wide'
      },
      {
        id: '03',
        tag: 'EN LA MESA',
        title: 'Alrededor de un café',
        caption: 'La vida de comunidad ocurre en las conversaciones pausadas, escuchando historias y compartiendo el pan.',
        image: 'assets/images/faro-comunidad-cafe-charla-bw.webp',
        alt: 'Dos personas conversando con tazas de café con el logo Comunidad FARO CDMX',
        aspectClass: 'moment-split'
      },
      {
        id: '04',
        tag: 'BIENVENIDA',
        title: 'Welcome to the Family',
        caption: 'Una puerta abierta para todo el que busca un hogar espiritual donde conocer a Jesús y pertenecer.',
        image: 'assets/images/faro-identidad-wearefaro-welcome.webp',
        alt: 'Espalda con camiseta WE ARE FARO ante pared con letrero Welcome to the Family',
        aspectClass: 'moment-split'
      },
      {
        id: '05',
        tag: 'HERENCIA',
        title: 'De generación en generación',
        caption: 'La ternura de enseñar y vivir el amor al Padre desde los primeros pasos de vida.',
        image: 'assets/images/faro-familias-pastor-nino-adoracion.webp',
        alt: 'Pastor sosteniendo a un niño pequeño en brazos durante tiempo de adoración',
        aspectClass: 'moment-duo'
      },
      {
        id: '06',
        tag: 'INTERCESIÓN',
        title: 'Hombro a hombro',
        caption: 'La sabiduría y oración de quienes han caminado más tiempo cubriendo y bendiciendo a la juventud.',
        image: 'assets/images/faro-oracion-intercesion-generacional.webp',
        alt: 'Mujer mayor orando con manos sobre los hombros de un joven en Comunidad FARO',
        aspectClass: 'moment-duo'
      },
      {
        id: '07',
        tag: 'VIDA REAL',
        title: 'La Casa no es un escenario',
        caption: 'Maternidad, ministerio y vocación conviviendo con naturalidad y verdad.',
        image: 'assets/images/faro-familias-pastora-bebe-ministerio.webp',
        alt: 'Pastora al micrófono con bebé en portabebés durante el servicio',
        aspectClass: 'moment-feature'
      },
      {
        id: '08',
        tag: 'COMUNIDAD',
        title: 'Cuidarnos los unos a los otros',
        caption: 'Oración, cercanía y acompañamiento real. La certeza de que en Casa nadie camina en soledad.',
        image: 'assets/images/faro-oracion-imposicion-manos.webp',
        alt: 'Comunidad unida en oración e imposición de manos con afecto y respeto',
        aspectClass: 'moment-cinema'
      }
    ]
  },
  music: {
    enabled: true,
    artistSpotifyUrl: 'https://open.spotify.com/intl-es/artist/6mkHWZP440ZFFjFv4Rw6DT',
    releases: [
      {
        title: 'Emmanuel',
        artist: 'A. Mendoza',
        eyebrow: 'SENCILLO · FARO MUSIC',
        duration: '4:22',
        coverImage: 'assets/images/emmanuel-cover.jpg',
        spotifyTrackId: '5RliVua1O5ZYn5cC2GYFan',
        platforms: [
          { name: 'Spotify', url: 'https://open.spotify.com/intl-es/track/5RliVua1O5ZYn5cC2GYFan' },
          { name: 'YouTube Music', url: 'https://music.youtube.com/search?q=Emmanuel+A.+Mendoza' },
          { name: 'Apple Music', url: 'https://music.apple.com/us/search?term=Emmanuel+A.+Mendoza' },
          { name: 'Amazon Music', url: 'https://music.amazon.com/search/Emmanuel+A.+Mendoza' },
          { name: 'Deezer', url: 'https://www.deezer.com/search/Emmanuel%20A.%20Mendoza' },
          { name: 'TIDAL', url: 'https://tidal.com/search?q=Emmanuel%20A.%20Mendoza' }
        ]
      },
      {
        title: 'El Cordero siendo Rey',
        artist: 'A. Mendoza',
        eyebrow: 'SENCILLO · FARO MUSIC',
        duration: '3:40',
        coverImage: 'assets/images/el-cordero-siendo-rey-cover.jpg',
        spotifyTrackId: '363HneBCibGkxjS7S2B70P',
        platforms: [
          { name: 'Spotify', url: 'https://open.spotify.com/intl-es/track/363HneBCibGkxjS7S2B70P' },
          { name: 'YouTube Music', url: 'https://music.youtube.com/search?q=El+Cordero+siendo+Rey+A.+Mendoza' },
          { name: 'Apple Music', url: 'https://music.apple.com/us/search?term=El+Cordero+siendo+Rey+A.+Mendoza' },
          { name: 'Amazon Music', url: 'https://music.amazon.com/search/El+Cordero+siendo+Rey+A.+Mendoza' },
          { name: 'Deezer', url: 'https://www.deezer.com/search/El%20Cordero%20siendo%20Rey%20A.%20Mendoza' },
          { name: 'TIDAL', url: 'https://tidal.com/search?q=El%20Cordero%20siendo%20Rey%20A.%20Mendoza' }
        ]
      },
      {
        title: 'El Dios Que Gobierna',
        artist: 'A. Mendoza',
        eyebrow: 'SENCILLO · FARO MUSIC',
        duration: '5:31',
        coverImage: 'assets/images/el-dios-que-gobierna.png',
        spotifyTrackId: '7BlZl5wsnxif6XalOeaTUa',
        platforms: [
          { name: 'Spotify', url: 'https://open.spotify.com/intl-es/track/7BlZl5wsnxif6XalOeaTUa' },
          { name: 'YouTube Music', url: 'https://music.youtube.com/search?q=El%20Dios%20Que%20Gobierna%20A.%20Mendoza' },
          { name: 'Apple Music', url: 'https://music.apple.com/us/search?term=El%20Dios%20Que%20Gobierna%20A.%20Mendoza' },
          { name: 'Amazon Music', url: 'https://music.amazon.com/search/El%20Dios%20Que%20Gobierna%20A.%20Mendoza' },
          { name: 'Deezer', url: 'https://www.deezer.com/search/El%20Dios%20Que%20Gobierna%20A.%20Mendoza' },
          { name: 'TIDAL', url: 'https://tidal.com/search?q=El%20Dios%20Que%20Gobierna%20A.%20Mendoza' }
        ]
      },
      {
        title: 'Nuestro Rey y Salvador',
        artist: 'A. Mendoza',
        eyebrow: 'SENCILLO · FARO MUSIC',
        duration: '5:20',
        coverImage: 'assets/images/nuestro-rey-y-salvador-cover.jpg',
        spotifyTrackId: '0jts4k4NeQtT61S8pKGRgf',
        platforms: [
          { name: 'Spotify', url: 'https://open.spotify.com/intl-es/track/0jts4k4NeQtT61S8pKGRgf' },
          { name: 'YouTube Music', url: 'https://music.youtube.com/search?q=Nuestro+Rey+y+Salvador+A.+Mendoza' },
          { name: 'Apple Music', url: 'https://music.apple.com/us/search?term=Nuestro+Rey+y+Salvador+A.+Mendoza' },
          { name: 'Amazon Music', url: 'https://music.amazon.com/search/Nuestro+Rey+y+Salvador+A.+Mendoza' },
          { name: 'Deezer', url: 'https://www.deezer.com/search/Nuestro%20Rey%20y%20Salvador%20A.%20Mendoza' },
          { name: 'TIDAL', url: 'https://tidal.com/search?q=Nuestro%20Rey%20y%20Salvador%20A.%20Mendoza' }
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
    ['¿Dónde se reúnen esta semana?', 'La ubicación no se deja fija en este sitio. Revisa la convocatoria vigente en nuestras redes.'],
    ['¿Y si la reunión es en casas?', 'Escríbenos desde el enlace Preguntar por la más cercana para conocer el punto que te conviene.'],
    ['¿Hay transmisión en vivo?', 'Cuando exista una transmisión confirmada, será lo primero que aparezca al entrar al sitio.'],
    ['¿Hay actividades para niños?', '[INFORMACIÓN POR CONFIRMAR]'],
    ['¿Necesito registrarme?', '[INFORMACIÓN POR CONFIRMAR]'],
    ['¿Hay código de vestimenta?', '[INFORMACIÓN POR CONFIRMAR]']
  ],
  photos: {
    hero: 'assets/images/faro-adoracion-congregacion-manos-dorado.webp',
    worship: '',
    people: '',
    prayer: '',
    footer: ''
  }
};