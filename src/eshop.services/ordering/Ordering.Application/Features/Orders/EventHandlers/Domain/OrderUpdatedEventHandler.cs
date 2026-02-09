using MassTransit;
using MassTransit.Transports;
using MediatR;
using Microsoft.Extensions.Logging;
using Ordering.Application.Extensions;
using Ordering.Domain.Abstractions;
using Ordering.Domain.Events;

namespace Ordering.Application.Features.Orders.EventHandlers.Domain;

public class OrderUpdatedEventHandler(IPublishEndpoint publishEndpoint, ILogger<OrderUpdatedEventHandler> logger, IEmailService emailService) : INotificationHandler<OrderUpdatedEvent>
{
    public async Task Handle(OrderUpdatedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("Domain Event Handled: {DomainEvent}", notification.GetType().Name);
        
        var orderDto = notification.Order.ToOrderDto();
        await publishEndpoint.Publish(orderDto,  cancellationToken);
    }
}