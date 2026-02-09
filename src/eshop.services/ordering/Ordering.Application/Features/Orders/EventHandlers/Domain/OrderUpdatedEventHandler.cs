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
        
        string subject = $"Update regarding Order #{notification.Order.Id.Value}";

        // MJML Template
        string body = $@"
        <mjml>
          <mj-body background-color='#f4f4f4'>
            <mj-section background-color='#ffffff' padding-bottom='0px' padding-top='0'>
              <mj-column width='100%'>
                 <mj-image src='https://idbyegxahkhicarnbekd.supabase.co/storage/v1/object/public/eshop_mail_appearance/Gemini_Generated_Image_u5eaetu5eaetu5ea.png'
          alt='eshop App' 
          padding='0'
          width='600px'> </mj-image>
              </mj-column>
            </mj-section>
            
            <mj-section background-color='#ffffff'>
              <mj-column width='100%'>
                <mj-text align='center' font-size='24px' color='#333' font-family='Helvetica Neue'>
                  It's on the way!
                </mj-text>
                
                <mj-text align='left' color='#555' font-family='Helvetica Neue' line-height='24px'>
                   Good news! Your order <strong>#{notification.Order.Id.Value}</strong> has been updated (Status: {notification.Order.OrderStatus}).
                   <br/><br/>
                   It is making its way to you. You can track its journey using the button below.
                </mj-text>

                <mj-button background-color='#2b2d42' href='https://eshop-app.com/track/{notification.Order.Id.Value}'>
                    Track My Package
                </mj-button>

                <mj-text align='center' color='#999' font-size='12px' font-family='Helvetica Neue'>
                   Need help? Reply to this email.
                </mj-text>
              </mj-column>
            </mj-section>
          </mj-body>
        </mjml>";

        await emailService.SendEmailAsync(notification.Order.ShippingAddress.EmailAddress, subject, body);
    }
}