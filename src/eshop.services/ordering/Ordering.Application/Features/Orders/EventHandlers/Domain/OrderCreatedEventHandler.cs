using MassTransit;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.FeatureManagement;
using Ordering.Application.Extensions;
using Ordering.Domain.Abstractions;
using Ordering.Domain.Events;

namespace Ordering.Application.Features.Orders.EventHandlers.Domain;

public class OrderCreatedEventHandler(IPublishEndpoint publishEndpoint, IFeatureManager featureManager, ILogger<OrderCreatedEventHandler> logger, IEmailService emailService) : INotificationHandler<OrderCreatedEvent>
{
    public async Task Handle(OrderCreatedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("Domain Event Handled: {DomainEvent}", notification.GetType().Name);

        if (await featureManager.IsEnabledAsync("OrderFulfilment"))
        {
            var orderCreatedIntegrationEvent = notification.Order.ToOrderDto();
            await publishEndpoint.Publish(orderCreatedIntegrationEvent, cancellationToken);
        }

        string subject = $"Order Confirmation: #{notification.Order.Id.Value}";

        // Prepare the Order Items List for the email
        // Assuming OrderItems has properties like ProductId, Price, Quantity
        var orderItemsRows = string.Join("", notification.Order.OrderItems.Select(item => $@"
            <tr>
                <td style='padding: 10px 0;'>{item.ProductId.Value}</td>
                <td style='padding: 10px 0; text-align: right;'>{item.Quantity}</td>
                <td style='padding: 10px 0; text-align: right;'>${item.Price}</td>
            </tr>
        "));

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
            
            <mj-section background-color='#ffffff' padding-bottom='0px' padding-top='0'>
              <mj-column width='100%'>
                <mj-text align='center' font-size='24px' color='#333' font-family='Helvetica Neue'>
                  Order Confirmed!
                </mj-text>
                <mj-text align='left' color='#555' font-family='Helvetica Neue' line-height='24px'>
                   Hi there, <br/><br/>
                   Thanks for shopping with <strong>eshop</strong>! We’ve received order <strong>#{notification.Order.Id.Value}</strong> and are getting it ready.
                </mj-text>
                
                <mj-divider border-color='#eee' border-width='1px'></mj-divider>
                
                <mj-table>
                    <tr style='border-bottom:1px solid #ecedee;text-align:left;'>
                      <th style='padding: 10px 0;'>Item</th>
                      <th style='padding: 10px 0; text-align: right;'>Qty</th>
                      <th style='padding: 10px 0; text-align: right;'>Price</th>
                    </tr>
                    {orderItemsRows}
                </mj-table>

                 <mj-divider border-color='#eee' border-width='1px'></mj-divider>

                 <mj-text align='left' color='#555' font-family='Helvetica Neue' line-height='24px'>
                    <strong>Shipping To:</strong><br/>
                    {notification.Order.ShippingAddress.FirstName} {notification.Order.ShippingAddress.LastName}<br/>
                    {notification.Order.ShippingAddress.AddressLine}<br/>
                    {notification.Order.ShippingAddress.Country}
                 </mj-text>

                 <mj-button background-color='#2b2d42' href='https://eshop-app.com/orders/{notification.Order.Id.Value}'>
                    View Your Order
                 </mj-button>
              </mj-column>
            </mj-section>
          </mj-body>
        </mjml>";

        await emailService.SendEmailAsync(notification.Order.ShippingAddress.EmailAddress, subject, body);
    }
}