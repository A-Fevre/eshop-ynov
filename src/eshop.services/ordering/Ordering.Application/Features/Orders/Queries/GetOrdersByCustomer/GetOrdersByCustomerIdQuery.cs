namespace Ordering.Application.Features.Orders.Queries.GetOrdersByCustomer;

using BuildingBlocks.CQRS;
using Ordering.Application.Features.Orders.Dtos;

/// <summary>
/// Represents a query to retrieve orders for a specific customer.
/// </summary>
public record GetOrdersByCustomerIdQuery(Guid CustomerId) : IQuery<GetOrdersByCustomerIdQueryResult>;
