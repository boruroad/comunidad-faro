export interface MeetingInfo {
  title: string;
  description: string;
  status: string;
  schedule: string;
  facebookUrl: string;
  onlineUrl: string;
  onlineLabel?: string;
  nearestUrl?: string;
}

export interface LiveBroadcast {
  enabled: boolean;
  label?: string;
  titleTop?: string;
  titleAccent?: string;
  description: string;
  buttonLabel?: string;
  url: string;
  embedUrl?: string;
  startsAt?: string;
  endsAt?: string;
}

export interface MusicPlatform {
  name: string;
  url: string;
}

export interface MusicRelease {
  title: string;
  artist: string;
  eyebrow?: string;
  duration?: string;
  coverImage: string;
  spotifyTrackId?: string;
  platforms: MusicPlatform[];
}

export interface CalendarEvent {
  date: string;
  title: string;
  time: string;
  location: string;
  description: string;
  ctaLabel?: string;
  ctaUrl?: string;
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

export interface Sermon {
  id: string;
  title: string;
  series?: string;
  date?: string;
  preacher?: string;
  thumbnail: string;
  thumbnailAlt: string;
  driveUrl: string;
  featured?: boolean;
}

export interface Clip {
  id: string;
  title: string;
  series: string;
  date?: string;
  duration?: string;
  posterUrl: string;
  videoUrl: string;
  driveFolderUrl?: string;
}

export interface FaroConfig {
  site: {
    name: string;
    canonicalUrl: string;
    description: string;
  };
  meeting: MeetingInfo;
  live: LiveBroadcast;
  calendar: {
    enabled: boolean;
    title: string;
    subtitle: string;
    events: CalendarEvent[];
  };
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
  sermons: {
    enabled: boolean;
    title: string;
    subtitle: string;
    featured: Sermon;
    list: Sermon[];
  };
  clips: {
    enabled: boolean;
    title: string;
    subtitle: string;
    items: Clip[];
  };
  newsletter: {
    enabled: boolean;
    buttondownUsername: string;
    actionUrl: string;
    tag: string;
  };
  socials: Record<string, string>;
  firstVisit: Array<[string, string]>;
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
    name: 'Comunidad FARO',
    canonicalUrl: 'https://comunidadfaro.org/',
    description: 'Comunidad cristiana en constante movimiento. Fe, amor, relevancia y obediencia como forma de vida.'
  },
  meeting: {
    title: 'Reunion presencial en ubicacion dinamica',
    description: 'Nuestra reunion principal se convoca semana a semana. Confirma el punto exacto antes de salir para que llegues a tiempo.',
    status: 'Presencial / Por confirmar cada semana',
    schedule: 'Domingo 11:00 AM (sujeto a convocatoria vigente)',
    facebookUrl: 'https://www.facebook.com/comunidad.FARO/',
    onlineUrl: '',
    onlineLabel: 'Entrar a la transmision',
    nearestUrl: 'https://www.facebook.com/comunidad.FARO/'
  },
  live: {
    enabled: false,
    label: 'TRANSMISION EN VIVO',
    titleTop: 'ESTAMOS',
    titleAccent: 'EN VIVO.',
    description: 'La reunion de Comunidad FARO esta al aire. Entra a la transmision para celebrar y adorar juntos.',
    buttonLabel: 'Entrar a la transmision',
    url: '',
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
        alt: 'Personas compartiendo café y conversación en un espacio acogedor',
        aspectClass: 'moment-medium'
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
          { name: 'YouTube Music', url: 'https://music.youtube.com/search?q=El%20Dios%20Que%20Gobierna%20A.+Mendoza' },
          { name: 'Apple Music', url: 'https://music.apple.com/us/search?term=El%20Dios%20Que%20Gobierna%20A.+Mendoza' },
          { name: 'Amazon Music', url: 'https://music.amazon.com/search/El%20Dios%20Que%20Gobierna%20A.+Mendoza' },
          { name: 'Deezer', url: 'https://www.deezer.com/search/El%20Dios%20Que%20Gobierna%20A.%20Mendoza' },
          { name: 'TIDAL', url: 'https://tidal.com/search?q=El%20Dios%20Que%20Gobierna%20A.+Mendoza' }
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
  sermons: {
    enabled: true,
    title: 'MENSAJES DE CASA',
    subtitle: 'Palabra compartida en nuestra comunidad para edificar, acompañar y profundizar en la fe.',
    featured: {
      id: 'sermon-encargos',
      title: 'Encargos',
      series: 'Mensajes de Casa',
      date: '2026',
      preacher: 'Comunidad FARO',
      thumbnail: 'assets/images/faro-predicacion-chaqueta-azul-dorado.webp',
      thumbnailAlt: 'Predicación Encargos en Comunidad FARO',
      driveUrl: 'https://drive.google.com/file/d/1uIPIiCmD3jMwcAXwn0FURKk8RbkpiOgA/view?usp=sharing',
      featured: true
    },
    list: [
      {
        id: 'sermon-domingo-de-ramos',
        title: 'Domingo de ramos',
        series: 'Mensajes de Casa',
        date: '2026',
        preacher: 'Comunidad FARO',
        thumbnail: 'assets/images/faro-predicacion-to-the-family.webp',
        thumbnailAlt: 'Domingo de ramos en Comunidad FARO',
        driveUrl: 'https://drive.google.com/file/d/1Gvr2ZU3lUf0IbOunSBbU3ClJrUQBGnNK/view?usp=sharing'
      },
      {
        id: 'sermon-frascos-rotos',
        title: 'Frascos rotos',
        series: 'Mensajes de Casa',
        date: '2026',
        preacher: 'Comunidad FARO',
        thumbnail: 'assets/images/faro-detalle-biblia-manos-mateo.webp',
        thumbnailAlt: 'Predicación Frascos rotos en Comunidad FARO',
        driveUrl: 'https://drive.google.com/file/d/1oglyXAQLiCyYV2wr7RS4h3JP6EnK6aZG/view?usp=sharing'
      },
      {
        id: 'sermon-fundamentos',
        title: 'Fundamentos',
        series: 'Serie Fundamentos',
        date: '2026',
        preacher: 'Comunidad FARO',
        thumbnail: 'assets/images/faro-predicacion-plataforma-bw.webp',
        thumbnailAlt: 'Enseñanza sobre Fundamentos en Comunidad FARO',
        driveUrl: 'https://drive.google.com/drive/folders/1AgQ5HUCvxtqF_d_486WvwTj3_IU3njwm?hl=es-419'
      },
      {
        id: 'sermon-resurreccion',
        title: 'Resurrección',
        series: 'Mensajes de Casa',
        date: '2026',
        preacher: 'Comunidad FARO',
        thumbnail: 'assets/images/faro-adoracion-congregacion-manos-dorado.webp',
        thumbnailAlt: 'Celebración y prédica de Resurrección',
        driveUrl: 'https://drive.google.com/file/d/1Gj2a0bUwTU4VvJ2ZcLtvF-R0OBa9kk9o/view?usp=sharing'
      },
      {
        id: 'sermon-caracteristicas-discipulo',
        title: 'Características del discípulo',
        series: 'Discipulado',
        date: '2026',
        preacher: 'Comunidad FARO',
        thumbnail: 'assets/images/faro-detalle-biblia-1reyes.webp',
        thumbnailAlt: 'Enseñanza de Características del discípulo',
        driveUrl: 'https://drive.google.com/file/d/1VaGo1zhNkXetFJ1-GEZgwtOry0IxcXOY/view?usp=sharing'
      },
      {
        id: 'sermon-10-de-mayo',
        title: '10 de mayo',
        series: 'Especial',
        date: '2026',
        preacher: 'Comunidad FARO',
        thumbnail: 'assets/images/faro-familias-oracion-bebe.webp',
        thumbnailAlt: 'Reunión especial 10 de mayo en Comunidad FARO',
        driveUrl: 'https://drive.google.com/file/d/11nThKVA1ijM4F-h_q4PhKi1wSmyJdpJF/view?usp=sharing'
      },
      {
        id: 'sermon-gedeon',
        title: 'Gedeón',
        series: 'Mensajes de Casa',
        date: '2026',
        preacher: 'Comunidad FARO',
        thumbnail: 'assets/images/faro-oracion-joven-tatuado-claroscuro.webp',
        thumbnailAlt: 'Predicación sobre Gedeón en Comunidad FARO',
        driveUrl: 'https://drive.google.com/file/d/1yG52RV6DnQTq3De1flZ-ol2mDpnNx6vo/view?usp=sharing'
      },
      {
        id: 'sermon-dia-del-padre',
        title: 'Día del padre',
        series: 'Especial',
        date: '2026',
        preacher: 'Comunidad FARO',
        thumbnail: 'assets/images/faro-oracion-muletas-abrazo.webp',
        thumbnailAlt: 'Reunión especial Día del padre en Comunidad FARO',
        driveUrl: 'https://drive.google.com/file/d/1LF1ixkH5yPYXyFrsPasV1NZUBrs67BY1/view?usp=sharing'
      },
      {
        id: 'sermon-esther',
        title: 'Prédica Esther',
        series: 'Mensajes de Casa',
        date: '2026',
        preacher: 'Comunidad FARO',
        thumbnail: 'assets/images/faro-adoracion-mujer-manos-foco-cenital.webp',
        thumbnailAlt: 'Prédica Esther en Comunidad FARO',
        driveUrl: 'https://drive.google.com/file/d/13Ss1td1Dct4Y5hOGEUMJ30Vy8Ouwc_5e/view?usp=sharing'
      },
      {
        id: 'sermon-escuela-capacitacion',
        title: 'Escuela de capacitación (Discipulado y ministerial)',
        series: 'Capacitación por fases',
        date: '2026',
        preacher: 'Comunidad FARO',
        thumbnail: 'assets/images/faro-oracion-intercesion-generacional.webp',
        thumbnailAlt: 'Escuela de capacitación en Comunidad FARO',
        driveUrl: 'https://drive.google.com/file/d/1guc3wCAcH15iFHyYco6YwVBFbGJi1-cd/view?usp=sharing'
      },
      {
        id: 'sermon-reuniones-en-casa',
        title: 'Reuniones en casa',
        series: 'Vida en Casa',
        date: '2026',
        preacher: 'Comunidad FARO',
        thumbnail: 'assets/images/faro-comunidad-cafe-charla-bw.webp',
        thumbnailAlt: 'Reuniones en casa en Comunidad FARO',
        driveUrl: 'https://drive.google.com/file/d/1auoWbCBknvWl1yotPQKcLiEhOhsd2I6W/view?usp=sharing'
      },
      {
        id: 'sermon-predica-1',
        title: 'Prédica',
        series: 'Mensajes de Casa',
        date: '2026',
        preacher: 'Comunidad FARO',
        thumbnail: 'assets/images/faro-adoracion-joven-perfil-calido.webp',
        thumbnailAlt: 'Prédica en Comunidad FARO',
        driveUrl: 'https://drive.google.com/file/d/1hWX0hgWahEOQK5a0lJrD8KtcFxculhTi/view?usp=sharing'
      },
      {
        id: 'sermon-predica-2',
        title: 'Prédica',
        series: 'Mensajes de Casa',
        date: '2026',
        preacher: 'Comunidad FARO',
        thumbnail: 'assets/images/faro-predicacion-to-the-family.webp',
        thumbnailAlt: 'Prédica en Comunidad FARO',
        driveUrl: 'https://drive.google.com/file/d/1s_WdIreFWInE6m_xf6I9uUp1_xg2YkLr/view?usp=sharing'
      },
      {
        id: 'sermon-predica-3',
        title: 'Prédica',
        series: 'Mensajes de Casa',
        date: '2026',
        preacher: 'Comunidad FARO',
        thumbnail: 'assets/images/faro-comunidad-abrazo-fraterno.webp',
        thumbnailAlt: 'Prédica en Comunidad FARO',
        driveUrl: 'https://drive.google.com/file/d/1QneWP5rJm0dgUdtWMXfiL4QlVtDAmMR-/view?usp=sharing'
      },
      {
        id: 'sermon-predica-4',
        title: 'Prédica',
        series: 'Mensajes de Casa',
        date: '2026',
        preacher: 'Comunidad FARO',
        thumbnail: 'assets/images/faro-predicacion-plataforma-bw.webp',
        thumbnailAlt: 'Prédica en Comunidad FARO',
        driveUrl: 'https://drive.google.com/file/d/1T2g1im99Nb3fjIY_JyaB-dITVLV1BH5U/view?usp=sharing'
      },
      {
        id: 'sermon-predica-5',
        title: 'Prédica',
        series: 'Mensajes de Casa',
        date: '2026',
        preacher: 'Comunidad FARO',
        thumbnail: 'assets/images/faro-detalle-biblia-manos-mateo.webp',
        thumbnailAlt: 'Prédica en Comunidad FARO',
        driveUrl: 'https://drive.google.com/file/d/1OXDeK-P4N9NXYAawY0esmqjsyDoWMqoh/view?usp=sharing'
      },
      {
        id: 'sermon-predica-6',
        title: 'Prédica',
        series: 'Mensajes de Casa',
        date: '2026',
        preacher: 'Comunidad FARO',
        thumbnail: 'assets/images/faro-oracion-imposicion-manos.webp',
        thumbnailAlt: 'Prédica en Comunidad FARO',
        driveUrl: 'https://drive.google.com/file/d/1dB74e2DLbnYaytVotgHiRIYQU9rQpyek/view?usp=sharing'
      },
      {
        id: 'sermon-predica-7',
        title: 'Prédica',
        series: 'Mensajes de Casa',
        date: '2026',
        preacher: 'Comunidad FARO',
        thumbnail: 'assets/images/faro-identidad-wearefaro-welcome.webp',
        thumbnailAlt: 'Prédica en Comunidad FARO',
        driveUrl: 'https://drive.google.com/file/d/1QgLk79hk1fGQKShhec0fNeVxGNi_3DWB/view?usp=sharing'
      }
    ]
  },
  clips: {
    enabled: true,
    title: 'REELS Y CLIPS DE CASA',
    subtitle: 'Enseñanzas e inspiraciones en menos de 60 segundos directo a tu día.',
    items: [
      {
        id: 'clip-fundamentos-obediencia',
        title: 'Cristianismo es Obediencia Diaria, No Solo Domingos',
        series: 'Fundamentos',
        date: '2026',
        duration: '0:34',
        posterUrl: 'assets/clips/poster-fundamentos-obediencia.webp',
        videoUrl: 'assets/clips/clip-fundamentos-obediencia.mp4',
        driveFolderUrl: 'https://drive.google.com/drive/folders/1AgQ5HUCvxtqF_d_486WvwTj3_IU3njwm?hl=es-419'
      },
      {
        id: 'clip-fundamentos-fe-actuar',
        title: 'Fe: Escuchar sin actuar es solo una ilusión',
        series: 'Fundamentos',
        date: '2026',
        duration: '0:38',
        posterUrl: 'assets/clips/poster-fundamentos-fe-actuar.webp',
        videoUrl: 'assets/clips/clip-fundamentos-fe-actuar.mp4',
        driveFolderUrl: 'https://drive.google.com/drive/folders/1AgQ5HUCvxtqF_d_486WvwTj3_IU3njwm?hl=es-419'
      },
      {
        id: 'clip-fundamentos-sobre-roca',
        title: 'Edificar sobre la Roca y no sobre la Arena',
        series: 'Fundamentos',
        date: '2026',
        duration: '0:42',
        posterUrl: 'assets/clips/poster-fundamentos-sobre-roca.webp',
        videoUrl: 'assets/clips/clip-fundamentos-sobre-roca.mp4',
        driveFolderUrl: 'https://drive.google.com/drive/folders/1AgQ5HUCvxtqF_d_486WvwTj3_IU3njwm?hl=es-419'
      },
      {
        id: 'clip-encargo-legado',
        title: 'Dios: El Legado es Para Tus Hijos',
        series: 'Encargo',
        date: '2026',
        duration: '0:35',
        posterUrl: 'assets/clips/poster-encargo-legado.webp',
        videoUrl: 'assets/clips/clip-encargo-legado.mp4',
        driveFolderUrl: 'https://drive.google.com/file/d/1uIPIiCmD3jMwcAXwn0FURKk8RbkpiOgA/view?usp=sharing'
      },
      {
        id: 'clip-encargo-divino',
        title: 'El Encargo Divino Para Tu Vida',
        series: 'Encargo',
        date: '2026',
        duration: '0:28',
        posterUrl: 'assets/clips/poster-encargo-divino.webp',
        videoUrl: 'assets/clips/clip-encargo-divino.mp4',
        driveFolderUrl: 'https://drive.google.com/file/d/1uIPIiCmD3jMwcAXwn0FURKk8RbkpiOgA/view?usp=sharing'
      },
      {
        id: 'clip-mama-oracion',
        title: 'La Oración de Mamá: Poder Divino en el Hogar',
        series: '10 de Mayo',
        date: '2026',
        duration: '0:40',
        posterUrl: 'assets/clips/poster-mama-oracion.webp',
        videoUrl: 'assets/clips/clip-mama-oracion.mp4',
        driveFolderUrl: 'https://drive.google.com/file/d/11nThKVA1ijM4F-h_q4PhKi1wSmyJdpJF/view?usp=sharing'
      },
      {
        id: 'clip-mama-guia',
        title: 'La Sabiduría de Madre que Forma Generaciones',
        series: '10 de Mayo',
        date: '2026',
        duration: '0:33',
        posterUrl: 'assets/clips/poster-mama-guia.webp',
        videoUrl: 'assets/clips/clip-mama-guia.mp4',
        driveFolderUrl: 'https://drive.google.com/file/d/11nThKVA1ijM4F-h_q4PhKi1wSmyJdpJF/view?usp=sharing'
      },
      {
        id: 'clip-padre-alineamiento',
        title: 'El Corazón de un Padre Guiado por el Reino',
        series: 'Día del Padre',
        date: '2026',
        duration: '0:31',
        posterUrl: 'assets/clips/poster-padre-alineamiento.webp',
        videoUrl: 'assets/clips/clip-padre-alineamiento.mp4',
        driveFolderUrl: 'https://drive.google.com/file/d/1LF1ixkH5yPYXyFrsPasV1NZUBrs67BY1/view?usp=sharing'
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