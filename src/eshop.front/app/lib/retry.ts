/**
 * Réessaie une requête asynchrone en cas d'échec.
 * Utile pour les loaders (SSR) quand le gateway peut échouer de façon transitoire
 * (connexion fermée, cold start, navigation client → nouveau run du loader).
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; delayMs?: number } = {}
): Promise<T> {
  const { retries = 5, delayMs = 1000 } = options;
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  throw lastError;
}
