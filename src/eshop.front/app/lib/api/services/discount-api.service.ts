import { createApiClient, getGatewayBase } from "../apiClient";
import type { ApiClient, ApiResponse } from "../apiClient";

/** Préfixe gateway pour le service Discount (YARP: /discount-service → discount.grpc) */
const DISCOUNT_PATH_PREFIX = "/discount-service";

/** Base path backend: api/Discounts */
const DISCOUNT_BASE = "/api/Discounts";

export interface ActivateDiscountRequest {
  code: string;
}

export interface ActivateDiscountResult {
  isSuccess?: boolean;
  code?: string;
  [key: string]: unknown;
}

export interface ValidateDiscountResult {
  isValid?: boolean;
  code?: string;
  [key: string]: unknown;
}

/** Coupon retourné par l'API Discount (aligné backend Coupon) */
export interface CouponDto {
  id?: number;
  productName?: string;
  code: string;
  description?: string;
  value: number;
  type?: "Percentage" | "FixedAmount";
  minimumOrderAmount?: number;
  [key: string]: unknown;
}

export interface DiscountByProductResult {
  coupons?: CouponDto[];
}

/**
 * Service API pour le domaine Discount
 * Routes backend: api/Discounts/activate, api/Discounts/validate/{code}, api/Discounts/product/{productId}
 */
export class DiscountApiService {
  private apiClient: ApiClient;

  constructor(apiClient?: ApiClient) {
    this.apiClient =
      apiClient ??
      createApiClient({ baseURL: getGatewayBase(), pathPrefix: DISCOUNT_PATH_PREFIX });
  }

  /** POST - Activer un coupon (backoffice) */
  async activateDiscount(
    request: ActivateDiscountRequest
  ): Promise<ApiResponse<ActivateDiscountResult>> {
    return this.apiClient.post<ActivateDiscountResult, ActivateDiscountRequest>(
      `${DISCOUNT_BASE}/activate`,
      request
    );
  }

  /** GET - Valider un code sans l'appliquer */
  async validateDiscount(code: string): Promise<ApiResponse<ValidateDiscountResult>> {
    return this.apiClient.get<ValidateDiscountResult>(
      `${DISCOUNT_BASE}/validate/${encodeURIComponent(code)}`
    );
  }

  /** GET - Réductions applicables à un produit */
  async getDiscountsByProduct(
    productId: string
  ): Promise<ApiResponse<DiscountByProductResult>> {
    return this.apiClient.get<DiscountByProductResult>(
      `${DISCOUNT_BASE}/product/${encodeURIComponent(productId)}`
    );
  }
}

export const discountApiService = new DiscountApiService();
