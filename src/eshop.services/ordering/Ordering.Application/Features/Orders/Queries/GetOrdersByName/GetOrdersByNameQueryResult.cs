using Ordering.Application.Features.Orders.Dtos;

namespace Ordering.Application.Features.Orders.Queries.GetOrdersByName;

/// <summary>
/// Represents the result of the GetOrdersByNameQuery.
/// </summary>
public record GetOrdersByNameQueryResult(IEnumerable<OrderDto> Orders);