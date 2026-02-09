using MassTransit;
using Ordering.Domain.Abstractions;
using Microsoft.Extensions.Logging;
using Ordering.Application.Features.Orders.Dtos;
using Ordering.Domain.Enums;

namespace Ordering.Application.Features.Orders.Consumers;

public class OrderEmailConsumer(IEmailService emailService, ILogger<OrderEmailConsumer> logger) 
    : IConsumer<OrderDto>
{
    public async Task Consume(ConsumeContext<OrderDto> context)
    {
        var order = context.Message;
        
        // Check the status to decide which template to use
        // Adjust "Pending" / "Created" based on your actual enum/string values
        if (order.OrderStatus == OrderStatus.Pending || order.OrderStatus == OrderStatus.Confirmed) 
        {
            logger.LogInformation("Sending Order Confirmation Email for Order: {OrderId}", order.Id);
            await SendConfirmationEmail(order);
        }
        else 
        {
            logger.LogInformation("Sending Order Update Email for Order: {OrderId} (Status: {Status})", order.Id, order.OrderStatus);
            await SendUpdateEmail(order);
        }
    }

    private async Task SendConfirmationEmail(OrderDto order)
    {
        string subject = $"Order Confirmation: #{order.Id}";

        // 1. Generate the Table Rows for Items
        // Assuming OrderDto.OrderItems has ProductName, Quantity, Price
        var orderItemsRows = string.Join("", order.OrderItems.Select(item => $@"
            <tr>
                <td style='padding: 10px 0;'>{item.ProductName}</td>
                <td style='padding: 10px 0; text-align: right;'>{item.Quantity}</td>
                <td style='padding: 10px 0; text-align: right;'>${item.Price}</td>
            </tr>
        "));

        // 2. The Confirmation MJML Template
        string body = $@"
        <mjml>
          <mj-body background-color='#f4f4f4'>
            <mj-section background-color='#b599e6' padding-bottom='0px' padding-top='0'>
              <mj-column width='100%'>
                <mj-image src='https://idbyegxahkhicarnbekd.supabase.co/storage/v1/object/public/eshop_mail_appearance/Gemini_Generated_Image_u5eaetu5eaetu5ea.png'
                          alt='eshop App' padding='0' width='600px'></mj-image>
              </mj-column>
            </mj-section>
            
            <mj-section background-color='#ffffff' padding-bottom='0px' padding-top='0'>
              <mj-column width='100%'>
                <mj-text align='center' font-size='24px' color='#333' font-family='Helvetica Neue'>
                  Order Confirmed!
                </mj-text>
                <mj-text align='left' color='#555' font-family='Helvetica Neue' line-height='24px'>
                   Hi {order.ShippingAddress.FirstName}, <br/><br/>
                   Thanks for shopping with <strong>eshop</strong>! We’ve received order <strong>#{order.OrderName}</strong> and are getting it ready.
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
                    {order.ShippingAddress.FirstName} {order.ShippingAddress.LastName}<br/>
                    {order.ShippingAddress.AddressLine}<br/>
                    {order.ShippingAddress.Country}
                 </mj-text>

                 <mj-button background-color='#2b2d42' href='https://eshop-app.com/orders/{order.Id}'>
                    View Your Order
                 </mj-button>
              </mj-column>
            </mj-section>
          </mj-body>
        </mjml>";

        await emailService.SendEmailAsync(order.ShippingAddress.EmailAddress, subject, body);
    }

    private async Task SendUpdateEmail(OrderDto order)
    {
        string subject = $"Update regarding Order #{order.Id}";

        // The Update MJML Template
        string body = $@"
        <mjml>
          <mj-body background-color='#f4f4f4'>
            <mj-section background-color='#b599e6' padding-bottom='0px' padding-top='0'>
              <mj-column width='100%'>
                 <mj-image src='https://idbyegxahkhicarnbekd.supabase.co/storage/v1/object/public/eshop_mail_appearance/Gemini_Generated_Image_u5eaetu5eaetu5ea.png'
                           alt='eshop App' padding='0' width='600px'></mj-image>
              </mj-column>
            </mj-section>
            
            <mj-section background-color='#ffffff'>
              <mj-column width='100%'>
                <mj-text align='center' font-size='24px' color='#333' font-family='Helvetica Neue'>
                  It's on the way!
                </mj-text>
                
                <mj-text align='left' color='#555' font-family='Helvetica Neue' line-height='24px'>
                   Good news! Your order <strong>#{order.OrderName}</strong> has been updated.<br/>
                   <strong>Current Status: {order.OrderStatus}</strong>
                   <br/><br/>
                   It is making its way to you. You can track its journey using the button below.
                </mj-text>

                <mj-button background-color='#2b2d42' href='https://eshop-app.com/track/{order.Id}'>
                    Track My Package
                </mj-button>

                <mj-text align='center' color='#999' font-size='12px' font-family='Helvetica Neue'>
                   Need help? Reply to this email.
                </mj-text>
              </mj-column>
            </mj-section>
          </mj-body>
        </mjml>";

        await emailService.SendEmailAsync(order.ShippingAddress.EmailAddress, subject, body);
    }
}