using BuildingBlocks.CQRS;
using Discount.Grpc.Data;
using Discount.Grpc.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Discount.Grpc.Features.Discounts.Queries.GetDiscountsByProduct;

/// <summary>
/// Gestionnaire pour la requête GetDiscountsByProductQuery.
/// Récupère tous les coupons actifs applicables à un produit donné.
/// </summary>
public class GetDiscountsByProductQueryHandler(
    DiscountContext dbContext,
    ILogger<GetDiscountsByProductQueryHandler> logger)
    : IQueryHandler<GetDiscountsByProductQuery, GetDiscountsByProductQueryResult>
{
    public async Task<GetDiscountsByProductQueryResult> Handle(
        GetDiscountsByProductQuery request,
        CancellationToken cancellationToken)
    {
        logger.LogInformation("Récupération des réductions pour le produit {ProductId}", request.ProductId);

        var now = DateTime.UtcNow;

        // Récupération de tous les coupons actifs et valides
        // Note: Pour l'instant, on retourne tous les coupons actifs
        // Dans une implémentation future, on pourrait ajouter une relation Product-Coupon
        var coupons = await dbContext.Coupons
            .Where(c => 
                !c.IsDeleted &&
                c.Status == DiscountStatus.Active &&
                c.StartDate <= now &&
                c.EndDate >= now)
            .ToListAsync(cancellationToken);

        logger.LogInformation("Trouvé {Count} réduction(s) pour le produit {ProductId}", 
            coupons.Count, request.ProductId);

        return new GetDiscountsByProductQueryResult(coupons);
    }
}
