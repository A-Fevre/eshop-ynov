import { createApiClient, getGatewayBase } from "../apiClient";
import type { ApiClient, ApiResponse } from "../apiClient";

/** Préfixe gateway pour le service Basket (YARP: /basket-service → basket.api) */
const BASKET_PATH_PREFIX = "/basket-service";

/**
 * Article du panier (aligné sur backend ShoppingCartItem)
 */
export interface BasketItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageFile?: string;
  code?: string;
  color?: string;
  discountPrice?: number;
}

/**
 * Modèle du panier (aligné sur backend ShoppingCart + compat front)
 */
export interface Basket {
  id: string;
  userId: string;
  items: BasketItem[];
  totalPrice: number;
  totalSavings?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Requête pour ajouter un article au panier (backend: ProductId, Quantity, Color)
 */
export interface AddItemToBasketRequest {
  productId: string;
  quantity: number;
  color?: string;
}

/**
 * Requête pour mettre à jour la quantité d'un article
 */
export interface UpdateBasketItemRequest {
  productId: string;
  quantity: number;
}

/**
 * Requête pour créer ou mettre à jour un panier complet
 */
export interface UpsertBasketRequest {
  userId: string;
  items: BasketItem[];
}

/**
 * DTO pour le checkout du panier (aligné BasketCheckoutDto backend)
 */
export interface BasketCheckoutDto {
  UserName?: string;
  CustomerId: string;
  TotalPrice: number;
  FirstName: string;
  LastName: string;
  EmailAddress: string;
  AddressLine: string;
  Country: string;
  State: string;
  ZipCode: string;
  CardName: string;
  CardNumber: string;
  Expiration: string;
  Cvv: string;
  PaymentMethod: number;
}

/**
 * Résultat du checkout (aligné CheckOutBasketCommandResult)
 */
export interface CheckOutBasketResult {
  message: string;
  totalPrice: number;
  isSuccess: boolean;
}

/**
 * Réponse panier (backend retourne ShoppingCart)
 */
export interface BasketResponse {
  id: string;
  userId: string;
  items: BasketItem[];
  totalPrice: number;
}

/** Réponse backend ShoppingCart (userName, items, total, totalSavings) */
interface ShoppingCartResponse {
  userName: string;
  items: Array<{
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    code?: string;
    color?: string;
    discountPrice?: number;
  }>;
  total: number;
  totalSavings?: number;
}

function mapShoppingCartToBasket(cart: ShoppingCartResponse): Basket {
  const totalSavings =
    cart.totalSavings != null && cart.totalSavings > 0
      ? Number(cart.totalSavings)
      : undefined;
  return {
    id: cart.userName,
    userId: cart.userName,
    items: cart.items.map((i) => ({
      productId: i.productId,
      productName: i.productName,
      price: i.price,
      quantity: i.quantity,
      imageFile: undefined,
      code: i.code,
      color: i.color,
      discountPrice: i.discountPrice,
    })),
    totalPrice:
      totalSavings != null ? totalSavings : Number(cart.total),
    totalSavings,
  };
}

/**
 * Service API pour le domaine Basket
 * Routes backend: Baskets/{userName}, Baskets/{userName}/items, etc.
 */
export class BasketApiService {
  private apiClient: ApiClient;

  constructor(apiClient?: ApiClient) {
    this.apiClient =
      apiClient ?? createApiClient({ baseURL: getGatewayBase(), pathPrefix: BASKET_PATH_PREFIX });
  }

  /**
   * GET - Récupère le panier d'un utilisateur (backend: GET Baskets/{userName})
   */
  async getBasket(userId: string): Promise<ApiResponse<Basket>> {
    const res = await this.apiClient.get<ShoppingCartResponse>(`/Baskets/${encodeURIComponent(userId)}`);
    return { ...res, data: mapShoppingCartToBasket(res.data) };
  }

  /**
   * GET - Récupère tous les paniers (non exposé par le backend actuel)
   */
  async getAllBaskets(): Promise<ApiResponse<Basket[]>> {
    return this.apiClient.get<Basket[]>("/Baskets");
  }

  /**
   * POST - Crée un panier (backend: POST Baskets/{userName}, body: CreateBasketCommand)
   */
  async upsertBasket(
    basket: UpsertBasketRequest
  ): Promise<ApiResponse<BasketResponse>> {
    const body = {
      cart: {
        userName: basket.userId,
        items: basket.items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          price: i.price,
          quantity: i.quantity,
          code: i.code ?? "",
          color: i.color ?? "",
        })),
      },
    };
    const res = await this.apiClient.post<{ isSuccess: boolean; userName: string }>(
      `/Baskets/${encodeURIComponent(basket.userId)}`,
      body
    );
    return {
      data: {
        id: res.data.userName,
        userId: res.data.userName,
        items: basket.items,
        totalPrice: basket.items.reduce((s, i) => s + i.price * i.quantity, 0),
      },
      status: res.status,
      statusText: res.statusText,
    };
  }

  /**
   * POST - Ajoute un article au panier (backend: POST Baskets/{userName}/items)
   */
  async addItemToBasket(
    userId: string,
    item: AddItemToBasketRequest
  ): Promise<ApiResponse<BasketResponse>> {
    const body = {
      productId: item.productId,
      quantity: item.quantity,
      color: item.color ?? "",
    };
    const res = await this.apiClient.post<ShoppingCartResponse>(
      `/Baskets/${encodeURIComponent(userId)}/items`,
      body
    );
    return {
      data: mapShoppingCartToBasket(res.data) as unknown as BasketResponse,
      status: res.status,
      statusText: res.statusText,
    };
  }

  /**
   * PUT - Met à jour la quantité d'un article (backend: PUT Baskets/{userName}, body: UpdateBasketCommand)
   */
  async updateBasketItem(
    userId: string,
    item: UpdateBasketItemRequest
  ): Promise<ApiResponse<BasketResponse>> {
    const body = {
      username: userId,
      items: {
        productId: item.productId,
        quantity: item.quantity,
        productName: "",
        price: 0,
        code: "",
        color: "",
      },
    };
    await this.apiClient.put<boolean>(`/Baskets/${encodeURIComponent(userId)}`, body);
    return this.getBasket(userId);
  }

  async patchBasketItem(
    userId: string,
    productId: string,
    updates: Partial<BasketItem>
  ): Promise<ApiResponse<BasketResponse>> {
    if (updates.quantity != null) {
      return this.updateBasketItem(userId, { productId, quantity: updates.quantity });
    }
    return this.getBasket(userId).then((r) => ({
      data: r.data as unknown as BasketResponse,
      status: r.status,
      statusText: r.statusText,
    }));
  }

  /**
   * DELETE - Supprime un article du panier (backend: DELETE Baskets/{userName}/items/{productId})
   */
  async removeItemFromBasket(
    userId: string,
    productId: string
  ): Promise<ApiResponse<BasketResponse>> {
    const res = await this.apiClient.delete<ShoppingCartResponse>(
      `/Baskets/${encodeURIComponent(userId)}/items/${productId}`
    );
    const cart = res.data ?? { userName: userId, items: [], total: 0 };
    return {
      data: mapShoppingCartToBasket(cart) as unknown as BasketResponse,
      status: res.status,
      statusText: res.statusText,
    };
  }

  /**
   * DELETE - Vide le panier (backend: DELETE Baskets/{userName})
   */
  async clearBasket(userId: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`/Baskets/${encodeURIComponent(userId)}`);
  }

  /**
   * POST - Checkout du panier (valide les réductions via Discount API, publie vers Ordering)
   */
  async checkout(
    userId: string,
    dto: BasketCheckoutDto
  ): Promise<ApiResponse<CheckOutBasketResult>> {
    const body = {
      BasketCheckoutDto: {
        ...dto,
        UserName: userId,
      },
    };
    return this.apiClient.post<CheckOutBasketResult>(
      `/Baskets/${encodeURIComponent(userId)}/Checkout`,
      body
    );
  }

  /**
   * POST - Valide le panier (non exposé par le backend actuel)
   */
  async validateBasket(
    userId: string
  ): Promise<ApiResponse<{ valid: boolean; errors?: string[] }>> {
    return this.apiClient.post<{ valid: boolean; errors?: string[] }>(
      `/Baskets/${encodeURIComponent(userId)}/validate`,
      {}
    );
  }
}

/**
 * Instance par défaut du service Basket
 * Utilisez cette instance dans votre application
 * @example
 * import { basketApiService } from './basketApi.service';
 * const basket = await basketApiService.getBasket('user123');
 */
export const basketApiService = new BasketApiService();
