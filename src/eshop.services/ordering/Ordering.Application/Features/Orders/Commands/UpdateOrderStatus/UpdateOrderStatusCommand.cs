using BuildingBlocks.CQRS;
using Ordering.Domain.Enums;

namespace Ordering.Application.Features.Orders.Commands.UpdateOrderStatus;

/// <summary>
/// Command to update the status of an order.
/// </summary>
public record UpdateOrderStatusCommand(Guid OrderId, OrderStatus Status) : ICommand<UpdateOrderStatusCommandResult>;