using BuildingBlocks.CQRS;
using Discount.Grpc.Models.Enums;

namespace Discount.Grpc.Features.Discounts.Commands.CreateCoupon;

/// <summary>
/// Commande pour créer un nouveau coupon de réduction.
/// </summary>
public record CreateCouponCommand(
    string Code,
    string Description,
    double Value,
    DiscountType Type,
    double MinimumOrderAmount,
    bool IsCumulative,
    DateTime StartDate,
    DateTime EndDate,
    bool AllowOnSaleItems = true
) : ICommand<CreateCouponCommandResult>;
