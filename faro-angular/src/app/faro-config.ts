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

export interface FaroConfig {
  site: {
    name: string;
    description: string;
    canonicalUrl: string;
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
    title: 'Nos vemos en Casa.',
    description: 'Revisa la publicacion mas reciente para confirmar el punto, la reunion en casas o el acceso en linea.',
    schedule: 'Consulta la convocatoria vigente',
    facebookUrl: 'https://www.facebook.com/comunidad.FARO/',
    nearestUrl: 'https://www.facebook.com/comunidad.FARO/',
    onlineUrl: '',
    onlineLabel: 'Entrar a la transmision'
  },
  live: {
    enabled: true,
    startsAt: '',
    endsAt: '',
    label: 'TRANSMISION EN VIVO',
    titleTop: 'ESTAMOS',
    titleAccent: 'EN VIVO.',
    description: 'Entra desde donde estes.',
    url: 'https://open.spotify.com/intl-es/track/7BlZl5wsnxif6XalOeaTUa',
    buttonLabel: 'Entrar a la transmision',
    embedUrl: ''
  },
  music: {
    enabled: true,
    releases: [
      {
        title: 'El Dios Que Gobierna',
        artist: 'A. Mendoza',
        eyebrow: 'YA DISPONIBLE',
        coverImage: '',
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
  socials: {
    facebook: 'https://www.facebook.com/comunidad.FARO/',
    instagram: 'https://www.instagram.com/comunidad_faro/',
    youtube: '',
    whatsapp: ''
  },
  firstVisit: [
    ['¿Donde se reunen esta semana?', 'La ubicacion no se deja fija en este sitio. Revisa la convocatoria vigente en nuestras redes.'],
    ['¿Y si la reunion es en casas?', 'Escribenos desde el enlace Preguntar por la mas cercana para conocer el punto que te conviene.'],
    ['¿Hay transmision en vivo?', 'Cuando exista una transmision confirmada, sera lo primero que aparezca al entrar al sitio.'],
    ['¿Hay actividades para ninos?', '[INFORMACION POR CONFIRMAR]'],
    ['¿Necesito registrarme?', '[INFORMACION POR CONFIRMAR]'],
    ['¿Hay codigo de vestimenta?', '[INFORMACION POR CONFIRMAR]']
  ],
  photos: {
    hero: '',
    worship: '',
    people: '',
    prayer: '',
    footer: ''
  }
};