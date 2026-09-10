import type { Lang } from "./i18n";

export type CCUser = {
  name: string;
  phone: string;
  village: string;
  pin: string;
  lang: Lang;
};

const KEY = "cc-user";

export function getStoredUser(): CCUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CCUser) : null;
  } catch {
    return null;
  }
}

export function storeUser(user: CCUser) {
  window.localStorage.setItem(KEY, JSON.stringify(user));
}

export function clearUser() {
  window.localStorage.removeItem(KEY);
}

export function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
