window.FARO_CONFIG = {
  site: {
    name: "Comunidad F.A.R.O.",
    description: "Fe, Amor, Relevancia y Obediencia. Una familia, muchas tribus.",
    canonicalUrl: "https://TU-DOMINIO-AQUI/"
  },

  /*
   * REUNIÓN DE ESTA SEMANA
   * Cambia sólo estos datos cuando exista una nueva convocatoria.
   */
  meeting: {
    status: "CONFIRMAR EN REDES",
    title: "La próxima convocatoria.",
    description: "Revisa la publicación más reciente para confirmar el punto, la reunión en casas o el acceso en línea.",
    schedule: "Consulta la convocatoria vigente",
    facebookUrl: "https://www.facebook.com/comunidad.FARO/",
    nearestUrl: "https://www.facebook.com/comunidad.FARO/",
    onlineUrl: "",
    onlineLabel: "Entrar a la transmisión"
  },

  /*
   * TRANSMISIÓN EN VIVO
   * No depende de una plataforma: url puede ser YouTube, Meet u otra.
   * Opción A: live.enabled = true / false.
   * Opción B: deja enabled=false y llena startsAt + endsAt para que se active solo.
   * Fechas en formato: 2026-08-16T11:00:00-06:00
   * embedUrl es opcional y sólo se usa si la plataforma permite iframe.
   */
  live: {
    enabled: false,
    startsAt: "",
    endsAt: "",
    label: "TRANSMISIÓN EN VIVO",
    titleTop: "ESTAMOS",
    titleAccent: "EN VIVO.",
    description: "Conéctate desde donde estés.",
    url: "https://www.youtube.com/watch?v=ZuEz0U2F7Yg",
    buttonLabel: "Entrar a la transmisión",
    embedUrl: ""
  },

  /*
   * MÚSICA DE CASA
   * Agrega más objetos al arreglo para publicar nuevas canciones.
   * coverImage es opcional; si queda vacío se genera una portada tipográfica.
   */
  music: {
    enabled: true,
    releases: [
      {
        title: "El Dios Que Gobierna",
        artist: "A. Mendoza",
        eyebrow: "YA DISPONIBLE",
        coverImage: "assets/images/el-dios-que-gobierna.png",
        platforms: [
          { name: "Spotify", url: "https://open.spotify.com/intl-es/track/7BlZl5wsnxif6XalOeaTUa" },
          { name: "YouTube Music", url: "https://music.youtube.com/search?q=El%20Dios%20Que%20Gobierna%20A.%20Mendoza" },
          { name: "Apple Music", url: "https://music.apple.com/us/search?term=El%20Dios%20Que%20Gobierna%20A.%20Mendoza" },
          { name: "Amazon Music", url: "https://music.amazon.com/search/El%20Dios%20Que%20Gobierna%20A.%20Mendoza" },
          { name: "Deezer", url: "https://www.deezer.com/search/El%20Dios%20Que%20Gobierna%20A.%20Mendoza" },
          { name: "TIDAL", url: "https://tidal.com/search?q=El%20Dios%20Que%20Gobierna%20A.%20Mendoza" }
        ]
      }
    ]
  },

  /*
   * NEWSLETTER
   * Recomendado: Buttondown porque acepta formularios HTML desde sitios estáticos.
   */
  newsletter: {
    enabled: true,
    buttondownUsername: "",
    actionUrl: "",
    tag: "sitio-web"
  },

  socials: {
    facebook: "https://www.facebook.com/comunidad.FARO/",
    instagram: "https://www.instagram.com/comunidad_faro/",
    youtube: "",
    whatsapp: ""
  },

  firstVisit: [
    ["¿Dónde se reúnen esta semana?", "La ubicación no se deja fija en este sitio. Revisa la convocatoria vigente en nuestras redes."],
    ["¿Y si la reunión es en casas?", "Escríbenos desde el enlace ‘Preguntar por la más cercana’ para conocer el punto que te conviene."],
    ["¿Hay transmisión en vivo?", "Cuando exista una transmisión confirmada, será lo primero que aparezca al entrar al sitio."],
    ["¿Hay actividades para niños?", "[INFORMACIÓN POR CONFIRMAR]"],
    ["¿Necesito registrarme?", "[INFORMACIÓN POR CONFIRMAR]"],
    ["¿Hay código de vestimenta?", "[INFORMACIÓN POR CONFIRMAR]"]
  ],

  /*
   * FOTOS LOCALES RECOMENDADAS
   * Guarda imágenes en assets/images/ y coloca aquí su ruta.
   */
  photos: {
    hero: "",
    worship: "",
    people: "",
    prayer: "",
    footer: ""
  }
};
