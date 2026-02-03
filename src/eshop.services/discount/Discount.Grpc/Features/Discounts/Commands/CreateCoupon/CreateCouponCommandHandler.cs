using BuildingBlocks.CQRS;
using BuildingBlocks.Exceptions;
using Discount.Grpc.Data;
using Discount.Grpc.Models;
using Discount.Grpc.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Discount.Grpc.Features.Discounts.Commands.CreateCoupon;

/// <summary>
/// Gestionnaire pour la commande CreateCouponCommand.
/// Crée un nouveau coupon de réduction dans la base de données.
/// </summary>
public class CreateCouponCommandHandler(
    DiscountContext dbContext,
    ILogger<CreateCouponCommandHandler> logger)
    : ICommandHandler<CreateCouponCommand, CreateCouponCommandResult>
{
    public async Task<CreateCouponCommandResult> Handle(
        CreateCouponCommand request,
        CancellationToken cancellationToken)
    {
        logger.LogInformation("Création du coupon {Code}", request.Code);

        // Vérification si le code existe déjà
        var existingCoupon = await dbContext.Coupons
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.Code == request.Code, cancellationToken);

        if (existingCoupon is not null)
        {
            throw new BadRequestException($"Un coupon avec le code '{request.Code}' existe déjà.");
        }

        // Création du nouveau coupon
        var coupon = new Coupon
        {
            Code = request.Code,
            Description = request.Description,
            Value = request.Value,
            Type = request.Type,
            MinimumOrderAmount = request.MinimumOrderAmount,
            IsCumulative = request.IsCumulative,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            AllowOnSaleItems = request.AllowOnSaleItems,
            Status = DiscountStatus.Upcoming,
            IsDeleted = false
        };

        dbContext.Coupons.Add(coupon);
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Coupon {Code} créé avec succès avec l'ID {Id}", request.Code, coupon.Id);

        return new CreateCouponCommandResult(
            Success: true,
            Message: $"Le coupon '{request.Code}' a été créé avec succès.",
            Coupon: coupon
        );
    }
}
