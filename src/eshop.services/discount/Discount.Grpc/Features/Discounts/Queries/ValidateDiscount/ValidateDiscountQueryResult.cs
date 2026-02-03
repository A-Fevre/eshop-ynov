using Discount.Grpc.Models;

namespace Discount.Grpc.Features.Discounts.Queries.ValidateDiscount;

/// <summary>
/// Résultat de la validation d'un code de réduction.
/// </summary>
/// <param name="IsValid">Indique si le code est valide.</param>
/// <param name="Reason">Raison de l'invalidité (si applicable).</param>
/// <param name="Coupon">Détails du coupon (si valide).</param>
public record ValidateDiscountQueryResult(
    bool IsValid,
    string? Reason,
    Coupon? Coupon
);
