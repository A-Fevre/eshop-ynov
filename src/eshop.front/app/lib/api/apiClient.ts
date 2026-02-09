/**
 * URL de base du gateway API (utilisée par les services pour préfixer les routes).
 * - Côté serveur (SSR / loaders) : process.env.API_BASE_URL (Docker: http://yarpapigateway:6064)
 * - Côté client (navigateur) : import.meta.env.VITE_API_BASE_URL (ex: http://localhost:6064)
 */
export function getGatewayBase(): string {
  // SSR / loaders : utiliser l’URL du gateway vue depuis le serveur (réseau Docker)
  if (typeof process !== "undefined" && process.env?.API_BASE_URL) {
    return String(process.env.API_BASE_URL).replace(/\/$/, "");
  }
  // Client (navigateur) ou fallback : URL inlinée au build ou défaut
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) {
    return String(import.meta.env.VITE_API_BASE_URL).replace(/\/$/, "");
  }
  return "http://localhost:6064";
}

/**
 * Configuration de base pour l'API
 */
export interface ApiConfig {
  baseURL: string;
  /** Préfixe de chemin (ex: /catalog-service) pour router via le gateway */
  pathPrefix?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Options pour les requêtes API
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  signal?: AbortSignal;
}

/**
 * Réponse standardisée de l'API
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

/**
 * Erreur API standardisée
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Client API réutilisable avec méthodes HTTP standard
 * Supporte GET, POST, PUT, DELETE et PATCH
 */
export class ApiClient {
  private config: Required<ApiConfig>;

  constructor(config: ApiConfig) {
    this.config = {
      baseURL: config.baseURL,
      pathPrefix: config.pathPrefix ?? "",
      timeout: config.timeout || 30000,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
    };
  }

  /**
   * Construit l'URL complète avec pathPrefix (gateway) et paramètres de requête
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const base = this.config.baseURL.replace(/\/$/, "");
    const prefix = (this.config.pathPrefix ?? "").replace(/\/$/, "");
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const fullPath = prefix ? `${prefix}${path}` : path;
    const url = new URL(fullPath, base);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Gère la requête fetch avec timeout et gestion d'erreurs
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: options.signal || controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError("Request timeout", 408, "Request Timeout");
      }
      throw error;
    }
  }

  /**
   * Traite la réponse et gère les erreurs
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let data: T;

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = (await response.text()) as any;
    }

    if (!response.ok) {
      throw new ApiError(
        `API Error: ${response.statusText}`,
        response.status,
        response.statusText,
        data
      );
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  /**
   * Effectue une requête HTTP générique
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, options?.params);

    // Ne pas envoyer Content-Type sur requêtes sans body (GET, DELETE) pour éviter le CORS preflight (OPTIONS)
    const hasBody = body !== undefined;
    const baseHeaders = { ...this.config.headers, ...options?.headers };
    const headers: Record<string, string> = hasBody
      ? baseHeaders
      : Object.fromEntries(Object.entries(baseHeaders).filter(([k]) => k !== "Content-Type"));

    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: options?.signal,
    };

    if (hasBody) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await this.fetchWithTimeout(url, fetchOptions);
    return this.handleResponse<T>(response);
  }

  /**
   * Méthode GET - Récupère des données
   * @example
   * const response = await api.get<Product[]>('/products');
   * const response = await api.get<Product>('/products/123');
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>("GET", endpoint, undefined, options);
  }

  /**
   * Méthode POST - Crée une nouvelle ressource
   * @example
   * const response = await api.post<Product>('/products', { name: 'New Product', price: 99.99 });
   */
  async post<T, D = any>(
    endpoint: string,
    data: D,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>("POST", endpoint, data, options);
  }

  /**
   * Méthode PUT - Met à jour complètement une ressource existante
   * @example
   * const response = await api.put<Product>('/products/123', { name: 'Updated Product', price: 149.99 });
   */
  async put<T, D = any>(
    endpoint: string,
    data: D,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", endpoint, data, options);
  }

  /**
   * Méthode DELETE - Supprime une ressource
   * @example
   * const response = await api.delete<void>('/products/123');
   */
  async delete<T = void>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", endpoint, undefined, options);
  }

  /**
   * Méthode PATCH - Met à jour partiellement une ressource
   * @example
   * const response = await api.patch<Product>('/products/123', { price: 199.99 });
   */
  async patch<T, D = any>(
    endpoint: string,
    data: D,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", endpoint, data, options);
  }

  /**
   * Met à jour la configuration du client
   */
  updateConfig(config: Partial<ApiConfig>): void {
    if (config.baseURL !== undefined) this.config.baseURL = config.baseURL;
    if (config.pathPrefix !== undefined) this.config.pathPrefix = config.pathPrefix;
    if (config.timeout !== undefined) this.config.timeout = config.timeout;
    if (config.headers) {
      this.config.headers = {
        ...this.config.headers,
        ...config.headers,
      };
    }
  }

  /**
   * Récupère la configuration actuelle
   */
  getConfig(): Required<ApiConfig> {
    return { ...this.config };
  }
}

/**
 * Instance par défaut du client API
 * Peut être configurée via les variables d'environnement
 */
export const createApiClient = (config?: Partial<ApiConfig>): ApiClient => {
  const defaultConfig: ApiConfig = {
    baseURL: config?.baseURL ?? getGatewayBase(),
    pathPrefix: config?.pathPrefix,
    timeout: config?.timeout ?? 30000,
    headers: config?.headers ?? {},
  };

  return new ApiClient(defaultConfig);
};
