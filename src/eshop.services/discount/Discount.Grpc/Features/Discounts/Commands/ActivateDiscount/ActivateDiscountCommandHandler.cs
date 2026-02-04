using BuildingBlocks.CQRS;
using BuildingBlocks.Exceptions;
using Discount.Grpc.Data;
using Discount.Grpc.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Discount.Grpc.Features.Discounts.Commands.ActivateDiscount;

/// <summary>
/// Gestionnaire pour la commande ActivateDiscountCommand.
/// Active un coupon de réduction en changeant son statut à "Active".
/// Réservé aux administrateurs backoffice.
/// </summary>
public class ActivateDiscountCommandHandler(
    DiscountContext dbContext,
    ILogger<ActivateDiscountCommandHandler> logger)
    : ICommandHandler<ActivateDiscountCommand, ActivateDiscountCommandResult>
{
    public async Task<ActivateDiscountCommandResult> Handle(
        ActivateDiscountCommand request,
        CancellationToken cancellationToken)
    {
        logger.LogInformation("Activation du coupon {Code}", request.Code);

        // Récupération du coupon depuis la base de données
        var coupon = await dbContext.Coupons
            .FirstOrDefaultAsync(c => 
                c.Code == request.Code && 
                !c.IsDeleted, 
                cancellationToken);

        if (coupon is null)
        {
            throw new NotFoundException($"Le coupon avec le code '{request.Code}' n'existe pas.");
        }

        // Vérification si le coupon est déjà actif
        if (coupon.Status == DiscountStatus.Active)
        {
            logger.LogInformation("Le coupon {Code} est déjà actif", request.Code);
            return new ActivateDiscountCommandResult(
                Success: true,
                Message: $"Le coupon '{request.Code}' est déjà actif.",
                Coupon: coupon
            );
        }

        // Vérification des dates de validité
        var now = DateTime.UtcNow;
        if (now < coupon.StartDate)
        {
            throw new BadRequestException(
                $"Impossible d'activer le coupon '{request.Code}'. Il n'est valide qu'à partir du {coupon.StartDate:dd/MM/yyyy}.");
        }

        if (now > coupon.EndDate)
        {
            throw new BadRequestException(
                $"Impossible d'activer le coupon '{request.Code}'. Il a expiré le {coupon.EndDate:dd/MM/yyyy}.");
        }

        // Activation du coupon
        coupon.Status = DiscountStatus.Active;
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Coupon {Code} activé avec succès", request.Code);

        return new ActivateDiscountCommandResult(
            Success: true,
            Message: $"Le coupon '{request.Code}' a été activé avec succès.",
            Coupon: coupon
        );
    }
}
