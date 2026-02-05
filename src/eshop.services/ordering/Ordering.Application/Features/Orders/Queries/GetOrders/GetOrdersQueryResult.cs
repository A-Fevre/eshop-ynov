using Ordering.Application.Features.Orders.Dtos;

namespace Ordering.Application.Features.Orders.Queries.GetOrders;

/// <summary>
/// Represents the result of the GetOrdersQuery.
/// </summary>
public record GetOrdersQueryResult(IEnumerable<OrderDto> Orders);