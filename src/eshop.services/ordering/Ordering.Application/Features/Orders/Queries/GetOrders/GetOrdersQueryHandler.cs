using BuildingBlocks.CQRS;
using Microsoft.EntityFrameworkCore;
using Ordering.Application.Extensions;
using Ordering.Application.Features.Orders.Data;

namespace Ordering.Application.Features.Orders.Queries.GetOrders;

/// <summary>
/// Handles the execution of the GetOrdersQuery.
/// </summary>
public class GetOrdersQueryHandler(IOrderingDbContext orderingDbContext) : IQueryHandler<GetOrdersQuery, GetOrdersQueryResult>
{
    public async Task<GetOrdersQueryResult> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
    {
        var pageNumber = request.PageIndex < 1 ? 1 : request.PageIndex;
        var pageSize = request.PageSize < 1 ? 10 : request.PageSize;


        var orders = await orderingDbContext.Orders
            .Include(o => o.OrderItems)
            .OrderByDescending(o => o.Id)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var ordersDto = orders
            .Select(o => o.ToOrderDto())
            .ToList();

        return new GetOrdersQueryResult(ordersDto);
    }
}