export function getCircularIndex(current: number, step: number, length: number) {
  if (length <= 0) return 0;
  return (current + step + length) % length;
}
