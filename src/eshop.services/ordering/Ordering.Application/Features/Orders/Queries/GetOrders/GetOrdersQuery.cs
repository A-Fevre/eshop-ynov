using BuildingBlocks.CQRS;
using Ordering.Application.Features.Orders.Dtos;

namespace Ordering.Application.Features.Orders.Queries.GetOrders;

/// <summary>
/// Represents a query to retrieve a paginated list of orders.
/// </summary>
public record GetOrdersQuery(int PageIndex = 0, int PageSize = 10) : IQuery<GetOrdersQueryResult>;