export function toPhotoBackground(path: string): string | null {
  return path
    ? `url("${path}")`
    : null;
}

export function toSocialLabel(name: string): string {
  return (
    name.charAt(0).toUpperCase() +
    name.slice(1) +
    ' ↗'
  );
}

export function toCoverAriaLabel(
  title: string,
  artist: string
): string {
  const base =
    `Portada de ${title || 'la canción'}`;

  return artist
    ? `${base}, de ${artist}`
    : base;
}
