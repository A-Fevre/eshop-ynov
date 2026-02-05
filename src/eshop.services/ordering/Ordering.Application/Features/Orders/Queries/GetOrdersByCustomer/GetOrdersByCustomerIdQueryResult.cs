namespace Ordering.Application.Features.Orders.Queries.GetOrdersByCustomer;

using Ordering.Application.Features.Orders.Dtos;

/// <summary>
/// Represents the result of the GetOrdersByCustomerIdQuery.
/// </summary>
public record GetOrdersByCustomerIdQueryResult(IEnumerable<OrderDto> Orders);
