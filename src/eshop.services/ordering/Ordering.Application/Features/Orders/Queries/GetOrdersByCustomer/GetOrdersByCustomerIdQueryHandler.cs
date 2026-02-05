using Ordering.Application.Extensions;
using Ordering.Domain.Models;
using Ordering.Domain.ValueObjects;

namespace Ordering.Application.Features.Orders.Queries.GetOrdersByCustomer;

using BuildingBlocks.CQRS;
using Microsoft.EntityFrameworkCore;
using Ordering.Application.Features.Orders.Data;

/// <summary>
/// Handles the execution of the GetOrdersByCustomerIdQuery.
/// </summary>
public class GetOrdersByCustomerIdQueryHandler(IOrderingDbContext orderingDbContext) : IQueryHandler<GetOrdersByCustomerIdQuery, GetOrdersByCustomerIdQueryResult>
{
    public async Task<GetOrdersByCustomerIdQueryResult> Handle(GetOrdersByCustomerIdQuery request, CancellationToken cancellationToken)
    {
        List<Order> orders = [];
        var customerId = CustomerId.Of(request.CustomerId);
        try
        {
            orders = await orderingDbContext.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.CustomerId == customerId)
                .OrderByDescending(o => o.Id)
                .ToListAsync(cancellationToken);

        }
        catch (Exception ex)
        {
            //
        }
        
        var ordersDto = orders
            .Select(o => o.ToOrderDto())
            .ToList();
            
        return new GetOrdersByCustomerIdQueryResult(ordersDto);
    }
}
