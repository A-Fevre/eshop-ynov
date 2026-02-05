using BuildingBlocks.CQRS;
using Ordering.Application.Features.Orders.Dtos;

namespace Ordering.Application.Features.Orders.Queries.GetOrdersByName;

/// <summary>
/// Represents a query to retrieve orders filtered by order name.
/// </summary>
public record GetOrdersByNameQuery(string Name) : IQuery<GetOrdersByNameQueryResult>;