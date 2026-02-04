using BuildingBlocks.CQRS;

namespace Discount.Grpc.Features.Discounts.Queries.GetDiscountsByProduct;

/// <summary>
/// Requête pour récupérer toutes les réductions applicables à un produit.
/// </summary>
/// <param name="ProductId">L'identifiant du produit.</param>
public record GetDiscountsByProductQuery(string ProductId) : IQuery<GetDiscountsByProductQueryResult>;
