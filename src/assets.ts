export function assetUrl(path: string) {
  const file = path.replace(/^\/+/, '');
  const optimized = import.meta.env.PROD && file.endsWith('.png') ? `media/${file.replace(/\.png$/, '')}.webp` : file;
  return `${import.meta.env.BASE_URL}${optimized}`;
}
