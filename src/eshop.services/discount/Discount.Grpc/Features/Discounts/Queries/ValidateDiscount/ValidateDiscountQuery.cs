using BuildingBlocks.CQRS;

namespace Discount.Grpc.Features.Discounts.Queries.ValidateDiscount;

/// <summary>
/// Requête pour valider un code de réduction.
/// </summary>
/// <param name="Code">Le code de réduction à valider.</param>
public record ValidateDiscountQuery(string Code) : IQuery<ValidateDiscountQueryResult>;
