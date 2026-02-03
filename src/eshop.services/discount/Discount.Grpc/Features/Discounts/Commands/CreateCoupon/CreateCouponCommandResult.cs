using Discount.Grpc.Models;

namespace Discount.Grpc.Features.Discounts.Commands.CreateCoupon;

/// <summary>
/// Résultat de la création d'un coupon.
/// </summary>
/// <param name="Success">Indique si la création a réussi.</param>
/// <param name="Message">Message descriptif du résultat.</param>
/// <param name="Coupon">Le coupon créé.</param>
public record CreateCouponCommandResult(
    bool Success,
    string Message,
    Coupon Coupon
);
