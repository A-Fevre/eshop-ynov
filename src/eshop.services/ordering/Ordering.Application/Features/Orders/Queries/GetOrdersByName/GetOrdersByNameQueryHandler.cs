using BuildingBlocks.CQRS;
using Microsoft.EntityFrameworkCore;
using Ordering.Application.Extensions;
using Ordering.Application.Features.Orders.Data;

namespace Ordering.Application.Features.Orders.Queries.GetOrdersByName;

/// <summary>
/// Handles the execution of the GetOrdersByNameQuery.
/// </summary>
public class GetOrdersByNameQueryHandler(IOrderingDbContext orderingDbContext) : IQueryHandler<GetOrdersByNameQuery, GetOrdersByNameQueryResult>
{
    public async Task<GetOrdersByNameQueryResult> Handle(GetOrdersByNameQuery request, CancellationToken cancellationToken)
    {
        var orders = await orderingDbContext.Orders
            .Include(o => o.OrderItems)
            .Where(o => EF.Functions.Like(o.OrderName.Value, $"%{request.Name}%"))
            .OrderByDescending(o => o.Id)
            .ToListAsync(cancellationToken);

        var ordersDto = orders
            .Select(o => o.ToOrderDto())
            .ToList();

        return new GetOrdersByNameQueryResult(ordersDto);
    }
}