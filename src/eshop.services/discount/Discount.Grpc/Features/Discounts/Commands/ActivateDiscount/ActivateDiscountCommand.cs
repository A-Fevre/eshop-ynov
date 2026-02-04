using BuildingBlocks.CQRS;

namespace Discount.Grpc.Features.Discounts.Commands.ActivateDiscount;

/// <summary>
/// Commande pour activer un coupon de réduction.
/// Réservé aux administrateurs backoffice.
/// </summary>
/// <param name="Code">Le code du coupon à activer.</param>
public record ActivateDiscountCommand(string Code) : ICommand<ActivateDiscountCommandResult>;
