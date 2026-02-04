using BuildingBlocks.CQRS;
using Discount.Grpc.Data;
using Discount.Grpc.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Discount.Grpc.Features.Discounts.Queries.ValidateDiscount;

/// <summary>
/// Gestionnaire pour la requête ValidateDiscountQuery.
/// Vérifie si un code de réduction est valide.
/// </summary>
public class ValidateDiscountQueryHandler(
    DiscountContext dbContext,
    ILogger<ValidateDiscountQueryHandler> logger)
    : IQueryHandler<ValidateDiscountQuery, ValidateDiscountQueryResult>
{
    public async Task<ValidateDiscountQueryResult> Handle(
        ValidateDiscountQuery request,
        CancellationToken cancellationToken)
    {
        logger.LogInformation("Validation du code de réduction {Code}", request.Code);

        var coupon = await dbContext.Coupons
            .FirstOrDefaultAsync(c => 
                c.Code == request.Code && 
                !c.IsDeleted, 
                cancellationToken);

        if (coupon is null)
        {
            return new ValidateDiscountQueryResult(
                IsValid: false,
                Reason: $"Le code '{request.Code}' n'existe pas.",
                Coupon: null
            );
        }

        // Vérification du statut
        if (coupon.Status != DiscountStatus.Active)
        {
            return new ValidateDiscountQueryResult(
                IsValid: false,
                Reason: $"Le code n'est pas actif (statut: {coupon.Status}).",
                Coupon: coupon
            );
        }

        // Vérification des dates
        var now = DateTime.UtcNow;
        if (now < coupon.StartDate)
        {
            return new ValidateDiscountQueryResult(
                IsValid: false,
                Reason: $"Le code n'est pas encore valide. Disponible à partir du {coupon.StartDate:dd/MM/yyyy}.",
                Coupon: coupon
            );
        }

        if (now > coupon.EndDate)
        {
            return new ValidateDiscountQueryResult(
                IsValid: false,
                Reason: $"Le code a expiré le {coupon.EndDate:dd/MM/yyyy}.",
                Coupon: coupon
            );
        }

        logger.LogInformation("Code de réduction {Code} valide", request.Code);

        return new ValidateDiscountQueryResult(
            IsValid: true,
            Reason: null,
            Coupon: coupon
        );
    }
}
