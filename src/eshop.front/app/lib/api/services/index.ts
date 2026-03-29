/**
 * Index centralisé pour tous les services API
 * Tous les services passent par l'API Gateway (YARP) avec les préfixes :
 * - /catalog-service → Catalog.API
 * - /basket-service → Basket.API
 * - /ordering-service → Ordering.API
 * - /discount-service → Discount.Grpc
 */

// Export des services
export { CatalogApiService, catalogApiService } from "./catalog-api.service";
export { BasketApiService, basketApiService } from "./basket-api.service";
export { OrderingApiService, orderingApiService } from "./ordering-api.service";
export { DiscountApiService, discountApiService } from "./discount-api.service";

// Export des types Catalog
export type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductListResponse,
  CreateProductResponse,
  UpdateProductResponse,
} from "./catalog-api.service";

// Export des types Basket
export type {
  Basket,
  BasketItem,
  AddItemToBasketRequest,
  UpdateBasketItemRequest,
  UpsertBasketRequest,
  BasketResponse,
  BasketCheckoutDto,
  CheckOutBasketResult,
} from "./basket-api.service";

// Export des types Ordering
export type {
  OrderDto,
  OrderStatus,
  AddressDto,
  PaymentDto,
  OrderItemDto,
} from "./ordering-api.service";

// Export des types Discount
export type {
  ActivateDiscountRequest,
  ActivateDiscountResult,
  ValidateDiscountResult,
  DiscountByProductResult,
  CouponDto,
} from "./discount-api.service";
