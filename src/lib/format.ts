export function pad(n: number, width = 3): string {
  return String(Math.max(0, Math.trunc(n))).padStart(width, "0");
}

export function formatMinutes(min: number): string {
  return min < 60 ? `${min} MIN` : `${Math.floor(min / 60)}H ${min % 60}M`;
}

export function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}
