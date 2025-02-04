import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDatetime(date?: string | null, fullDate = false, withSeconds = false) {
  if (!date) return "-";

  const dt = new Date(date);
  const isToday = new Date().toDateString() === dt.toDateString();

  let options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: withSeconds ? "2-digit" : undefined,
  };

  if (!isToday || fullDate) {
    options = {
      ...options,
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    };
  }

  return new Intl.DateTimeFormat("pt-BR", options).format(dt);
}
