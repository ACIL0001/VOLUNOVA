/**
 * Obfuscates coordinates within a ~500m gaussian jitter
 * for public/non-owner views to protect volunteer privacy.
 */
export function obfuscateCoordinates([lng, lat]: [number, number]): [number, number] {
  const radiusInDegrees = 500 / 111300; // ~500m in degrees
  const u = Math.random();
  const v = Math.random();
  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = (w * Math.sin(t)) / Math.cos((lat * Math.PI) / 180);
  return [Number((lng + x).toFixed(4)), Number((lat + y).toFixed(4))];
}
