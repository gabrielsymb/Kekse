import type { StoredCard } from "./types";

export function formatDue(card: StoredCard) {
  const minutes = Math.round(
    (new Date(card.due).getTime() - Date.now()) / 60_000,
  );
  if (minutes <= 0) return "agora";
  if (minutes < 60) return `em ${minutes} min`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `em ${hours} h` : `em ${Math.round(hours / 24)} d`;
}

export function scoreLabel(mastery: number, attempts: number) {
  if (attempts === 0) return "a observar";
  if (mastery < 0.35) return "precisa voltar";
  if (mastery < 0.7) return "em construção";
  return "mais estável";
}
