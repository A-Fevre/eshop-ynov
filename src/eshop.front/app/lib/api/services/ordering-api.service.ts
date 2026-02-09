import { createApiClient, getGatewayBase } from "../apiClient";
import type { ApiClient, ApiResponse } from "../apiClient";

/** Préfixe gateway pour le service Ordering (YARP: /ordering-service → ordering.api) */
const ORDERING_PATH_PREFIX = "/ordering-service";

/** Statut de commande (aligné backend OrderStatus) */
export type OrderStatus =
  | "Draft"
  | "Pending"
  | "Submitted"
  | "Cancelled"
  | "Confirmed"
  | "Completed"
  | "Shipped"
  | "Delivered";

export interface AddressDto {
  firstName: string;
  lastName: string;
  emailAddress: string;
  addressLine: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface PaymentDto {
  cardName: string;
  cardNumber: string;
  expiration: string;
  cvv: string;
  paymentMethod: number;
}

export interface OrderItemDto {
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface OrderDto {
  id: string;
  customerId: string;
  orderName: string;
  shippingAddress: AddressDto;
  billingAddress: AddressDto;
  payment: PaymentDto;
  orderStatus: OrderStatus;
  orderItems: OrderItemDto[];
}

/**
 * Service API pour le domaine Ordering
 * Routes backend: Orders, Orders/by-name/{name}, Orders/customer/{customerId}, etc.
 */
export class OrderingApiService {
  private apiClient: ApiClient;

  constructor(apiClient?: ApiClient) {
    this.apiClient =
      apiClient ??
      createApiClient({ baseURL: getGatewayBase(), pathPrefix: ORDERING_PATH_PREFIX });
  }

  /** GET - Liste des commandes par nom */
  async getOrdersByName(name: string): Promise<ApiResponse<OrderDto[]>> {
    return this.apiClient.get<OrderDto[]>(`/Orders/by-name/${encodeURIComponent(name)}`);
  }

  /** GET - Liste des commandes par client */
  async getOrdersByCustomerId(customerId: string): Promise<ApiResponse<OrderDto[]>> {
    return this.apiClient.get<OrderDto[]>(`/Orders/customer/${customerId}`);
  }

  /** GET - Liste paginée des commandes */
  async getOrders(pageIndex = 0, pageSize = 10): Promise<ApiResponse<OrderDto[]>> {
    return this.apiClient.get<OrderDto[]>("/Orders", {
      params: { pageIndex, pageSize },
    });
  }

  /** POST - Créer une commande */
  async createOrder(order: OrderDto): Promise<ApiResponse<string>> {
    return this.apiClient.post<string, OrderDto>("/Orders", order);
  }

  /** PUT - Mettre à jour une commande */
  async updateOrder(order: OrderDto): Promise<ApiResponse<boolean>> {
    return this.apiClient.put<boolean, OrderDto>("/Orders", order);
  }

  /** DELETE - Supprimer une commande */
  async deleteOrder(orderId: string): Promise<ApiResponse<boolean>> {
    return this.apiClient.delete<boolean>(`/Orders/${orderId}`);
  }

  /** PATCH - Mettre à jour le statut d'une commande */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<ApiResponse<boolean>> {
    return this.apiClient.patch<boolean>(`/Orders/${orderId}/status`, {}, {
      params: { status },
    });
  }
}

export const orderingApiService = new OrderingApiService();
