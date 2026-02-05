using BuildingBlocks.CQRS;
using Microsoft.EntityFrameworkCore;
using Ordering.Application.Features.Orders.Data;
using Ordering.Domain.ValueObjects.Types;

namespace Ordering.Application.Features.Orders.Commands.UpdateOrderStatus;

public class UpdateOrderStatusCommandHandler(IOrderingDbContext orderingDbContext) : ICommandHandler<UpdateOrderStatusCommand, UpdateOrderStatusCommandResult>
{
    public async Task<UpdateOrderStatusCommandResult> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var query = orderingDbContext.Orders.AsQueryable();

        var orderId = OrderId.Of(request.OrderId);
        var order = await query.FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);

        if (order is null)
            return new UpdateOrderStatusCommandResult(false);

        order.UpdateStatus(request.Status);

        await orderingDbContext.SaveChangesAsync(cancellationToken);

        return new UpdateOrderStatusCommandResult(true);
    }
}