using Discount.Grpc.Models;

namespace Discount.Grpc.Features.Discounts.Queries.GetDiscountsByProduct;

/// <summary>
/// Résultat de la requête pour récupérer les réductions d'un produit.
/// </summary>
/// <param name="Coupons">Liste des coupons applicables au produit.</param>
public record GetDiscountsByProductQueryResult(List<Coupon> Coupons);
