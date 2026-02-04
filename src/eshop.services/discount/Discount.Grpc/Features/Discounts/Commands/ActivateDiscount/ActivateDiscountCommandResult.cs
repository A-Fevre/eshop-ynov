using Discount.Grpc.Models;

namespace Discount.Grpc.Features.Discounts.Commands.ActivateDiscount;

/// <summary>
/// Résultat de l'activation d'un coupon.
/// </summary>
/// <param name="Success">Indique si l'activation a réussi.</param>
/// <param name="Message">Message descriptif du résultat.</param>
/// <param name="Coupon">Le coupon activé.</param>
public record ActivateDiscountCommandResult(
    bool Success,
    string Message,
    Coupon Coupon
);
