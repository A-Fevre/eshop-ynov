/**
 * Mock utilisateur stocké dans un cookie (pour démo / dev).
 * À remplacer par une vraie auth (session, JWT) en production.
 */

export const MOCK_USER_COOKIE_NAME = "eshop_mock_user";

const COOKIE_MAX_AGE_DAYS = 365;
const COOKIE_PATH = "/";

/**
 * Parse le header Cookie (côté serveur) et retourne le userName à utiliser (Baskets/{userName}).
 * Les valeurs "guest-*" sont normalisées vers DEFAULT_MOCK_USERNAME.
 */
export function getMockUserIdFromCookieHeader(cookieHeader: string | null): string | undefined {
  if (!cookieHeader?.length) return undefined;
  const match = cookieHeader
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${MOCK_USER_COOKIE_NAME}=`));
  if (!match) return undefined;
  const value = match.slice(MOCK_USER_COOKIE_NAME.length + 1).trim();
  const decoded = value.length > 0 ? decodeURIComponent(value) : undefined;
  return normalizeMockUsername(decoded);
}

/**
 * Lit la valeur brute du cookie mock user (côté client).
 * Utiliser normalizeMockUsername() pour obtenir le userName des routes Baskets/{userName}.
 */
export function getMockUserIdFromDocument(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${MOCK_USER_COOKIE_NAME}=`));
  if (!match) return undefined;
  const value = match.slice(MOCK_USER_COOKIE_NAME.length + 1).trim();
  return value.length > 0 ? decodeURIComponent(value) : undefined;
}

/**
 * Définit le cookie mock user (côté client).
 * @param userId - userName à stocker (utilisé dans Baskets/{userName})
 * @param maxAgeDays - Durée de vie du cookie en jours
 */
export function setMockUserId(
  userId: string,
  maxAgeDays: number = COOKIE_MAX_AGE_DAYS
): void {
  if (typeof document === "undefined") return;
  const maxAge = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${MOCK_USER_COOKIE_NAME}=${encodeURIComponent(userId)}; path=${COOKIE_PATH}; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Supprime le cookie mock user (côté client).
 */
export function clearMockUserId(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${MOCK_USER_COOKIE_NAME}=; path=${COOKIE_PATH}; max-age=0`;
}

/**
 * Nom d'utilisateur mock par défaut.
 * Aligné sur le backend Basket.API : routes Baskets/{userName}, pas de notion "guest" côté API.
 */
export const DEFAULT_MOCK_USERNAME = "GorlockTheDestroyer";

/**
 * Retourne le userName à utiliser pour les appels API (Baskets/{userName}).
 * Les anciennes valeurs "guest-*" sont normalisées vers DEFAULT_MOCK_USERNAME.
 */
export function normalizeMockUsername(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  const trimmed = value.trim();
  if (trimmed.startsWith("guest-")) return DEFAULT_MOCK_USERNAME;
  return trimmed;
}

/**
 * Génère le userName mock pour un nouvel utilisateur (aligné sur les routes backend).
 */
export function generateMockUserId(): string {
  return DEFAULT_MOCK_USERNAME;
}
