import { createApiClient, getGatewayBase } from "../apiClient";
import type { ApiClient, ApiResponse } from "../apiClient";

/**
 * Modèle de produit du catalogue
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageFile: string;
  categories: string[];
}

/**
 * Requête pour créer un produit
 */
export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  imageFile: string;
  categories: string[];
}

/**
 * Requête pour mettre à jour un produit
 */
export interface UpdateProductRequest {
  id: string;
  name: string;
  description: string;
  price: number;
  imageFile: string;
  categories: string[];
}

/**
 * Réponse paginée de la liste de produits
 */
export interface ProductListResponse {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: Product[];
  count?: number; // Added to support usages where count is accessed instead of totalCount or checks
}

/**
 * Réponse de création de produit
 */
export interface CreateProductResponse {
  id: string;
}

/**
 * Réponse de mise à jour de produit
 */
export interface UpdateProductResponse {
  id: string;
}

/**
 * Service API pour le domaine Catalog
 * Gère toutes les opérations liées aux produits
 */
/** Préfixe gateway pour le service Catalog (YARP: /catalog-service → catalog.api) */
const CATALOG_PATH_PREFIX = "/catalog-service";

export class CatalogApiService {
  private apiClient: ApiClient;

  constructor(apiClient?: ApiClient) {
    this.apiClient =
      apiClient ??
      createApiClient({ baseURL: getGatewayBase(), pathPrefix: CATALOG_PATH_PREFIX });
  }

  /**
   * GET - Récupère tous les produits avec pagination
   * @param pageIndex - Index de la page (0-based côté front, converti en pageNumber 1-based pour l'API)
   * @param pageSize - Nombre d'éléments par page
   */
  async getProducts(
    pageIndex = 0,
    pageSize = 10
  ): Promise<ApiResponse<ProductListResponse>> {
    const pageNumber = pageIndex + 1; // Backend attend pageNumber 1-based
    return this.apiClient.get<ProductListResponse>("/products", {
      params: { pageNumber, pageSize },
    });
  }

  /**
   * GET - Récupère un produit par son ID
   * @param id - ID du produit (GUID)
   * @example
   * const product = await catalogService.getProductById('123e4567-e89b-12d3-a456-426614174000');
   */
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    return this.apiClient.get<Product>(`/products/${id}`);
  }

  /**
   * GET - Récupère les produits par catégorie
   * @param category - Nom de la catégorie
   * @param pageIndex - Index de la page
   * @param pageSize - Nombre d'éléments par page
   * @example
   * const products = await catalogService.getProductsByCategory('Electronics', 0, 10);
   */
  async getProductsByCategory(
    category: string,
    pageIndex = 0,
    pageSize = 10
  ): Promise<ApiResponse<ProductListResponse>> {
    const pageNumber = pageIndex + 1;
    return this.apiClient.get<ProductListResponse>("/products/category", {
      params: { category, pageNumber, pageSize },
    });
  }

  /**
   * POST - Crée un nouveau produit
   * @param product - Données du produit à créer
   * @example
   * const response = await catalogService.createProduct({
   *   name: 'iPhone 15',
   *   description: 'Latest iPhone model',
   *   price: 999.99,
   *   imageFile: 'iphone15.jpg',
   *   categories: ['Electronics', 'Smartphones']
   * });
   */
  async createProduct(
    product: CreateProductRequest
  ): Promise<ApiResponse<CreateProductResponse>> {
    return this.apiClient.post<CreateProductResponse, CreateProductRequest>(
      "/products",
      product
    );
  }

  /**
   * PUT - Met à jour complètement un produit existant
   * @param product - Données complètes du produit à mettre à jour
   * @example
   * const response = await catalogService.updateProduct({
   *   id: '123e4567-e89b-12d3-a456-426614174000',
   *   name: 'iPhone 15 Pro',
   *   description: 'Updated description',
   *   price: 1099.99,
   *   imageFile: 'iphone15pro.jpg',
   *   categories: ['Electronics', 'Smartphones']
   * });
   */
  async updateProduct(
    product: UpdateProductRequest
  ): Promise<ApiResponse<UpdateProductResponse>> {
    return this.apiClient.put<UpdateProductResponse, UpdateProductRequest>(
      `/products/${product.id}`,
      product
    );
  }

  /**
   * DELETE - Supprime un produit par son ID
   * @param id - ID du produit à supprimer
   * @example
   * await catalogService.deleteProduct('123e4567-e89b-12d3-a456-426614174000');
   */
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`/products/${id}`);
  }

  /**
   * PATCH - Met à jour partiellement un produit (custom implementation)
   * Note: Cette méthode peut ne pas être supportée par l'API backend actuelle
   * @param id - ID du produit
   * @param updates - Champs à mettre à jour
   * @example
   * await catalogService.patchProduct('123e4567-e89b-12d3-a456-426614174000', {
   *   price: 899.99
   * });
   */
  async patchProduct(
    id: string,
    updates: Partial<Omit<Product, "id">>
  ): Promise<ApiResponse<UpdateProductResponse>> {
    return this.apiClient.patch<UpdateProductResponse, Partial<Omit<Product, "id">>>(
      `/products/${id}`,
      updates
    );
  }

  /**
   * GET - Récupère toutes les catégories disponibles
   * Note: Endpoint custom, peut nécessiter une implémentation backend
   * @example
   * const categories = await catalogService.getCategories();
   */
  async getCategories(): Promise<ApiResponse<string[]>> {
    return this.apiClient.get<string[]>("/products/categories");
  }

  /**
   * POST - Recherche de produits avec filtres
   * Note: Endpoint custom, peut nécessiter une implémentation backend
   * @param query - Terme de recherche
   * @param filters - Filtres additionnels
   * @example
   * const results = await catalogService.searchProducts('iPhone', {
   *   minPrice: 500,
   *   maxPrice: 1500,
   *   categories: ['Electronics']
   * });
   */
  async searchProducts(
    query: string,
    filters?: {
      minPrice?: number;
      maxPrice?: number;
      categories?: string[];
    }
  ): Promise<ApiResponse<ProductListResponse>> {
    return this.apiClient.post<ProductListResponse>("/products/search", {
      query,
      ...filters,
    });
  }
}

/**
 * Instance par défaut du service Catalog
 * Utilisez cette instance dans votre application
 * @example
 * import { catalogApiService } from './catalogApi.service';
 * const products = await catalogApiService.getProducts();
 */
export const catalogApiService = new CatalogApiService();
