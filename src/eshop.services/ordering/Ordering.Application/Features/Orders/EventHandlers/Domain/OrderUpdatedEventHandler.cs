using MediatR;
using Microsoft.Extensions.Logging;
using Ordering.Domain.Abstractions;
using Ordering.Domain.Events;

namespace Ordering.Application.Features.Orders.EventHandlers.Domain;

public class OrderUpdatedEventHandler(ILogger<OrderUpdatedEventHandler> logger, IEmailService emailService) : INotificationHandler<OrderUpdatedEvent>
{
    public async Task Handle(OrderUpdatedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("Domain Event Handled: {DomainEvent}", notification.GetType().Name);
        string subject = $"Order Updated: #{notification.Order.Id.Value}";
        string body = $"Hello, your order #{notification.Order.Id.Value} has been updated. Please check your dashboard for details.";
        await emailService.SendEmailAsync(notification.Order.ShippingAddress.EmailAddress, subject, body);
    }
}