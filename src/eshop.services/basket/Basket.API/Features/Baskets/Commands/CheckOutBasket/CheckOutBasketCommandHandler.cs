using Basket.API.Data.Repositories;
using BuildingBlocks.CQRS;
using BuildingBlocks.Messaging.Events;
using Discount.Grpc;
using Mapster;
using MassTransit;

namespace Basket.API.Features.Baskets.Commands.CheckOutBasket;

/// <summary>
/// Handles the checkout process for a user's basket. This class retrieves the basket data,
/// publishes a checkout event, and removes the basket from the repository after a successful checkout.
/// </summary>
/// <remarks>
/// This command handler processes <see cref="CheckOutBasketCommand"/> requests, executes the required business logic,
/// and returns a <see cref="CheckOutBasketCommandResult"/> indicating the outcome of the operation.
/// It also integrates with the messaging system via <see cref="IPublishEndpoint"/> to notify other systems
/// about the basket checkout event.
/// </remarks>
public class CheckOutBasketCommandHandler(IBasketRepository repository, IPublishEndpoint publishEndpoint, DiscountProtoService.DiscountProtoServiceClient discountProtoService)
    : ICommandHandler<CheckOutBasketCommand, CheckOutBasketCommandResult>
{
    /// <summary>
    /// Handles the checkout process for the user's basket, publishing a checkout event and deleting the basket upon success.
    /// </summary>
    /// <param name="request">The command request containing the basket checkout details.</param>
    /// <param name="cancellationToken">The token to monitor for cancellation requests.</param>
    /// <returns>A task representing the asynchronous operation, containing the result of the checkout process.</returns>
    public async Task<CheckOutBasketCommandResult> Handle(CheckOutBasketCommand request,
        CancellationToken cancellationToken)
    {
        var basket = await repository.GetBasketByUserNameAsync(request.BasketCheckoutDto.UserName, cancellationToken)
            .ConfigureAwait(false);
        
        List<object> discountCodes = [];

        foreach(var item in basket.Items)
        {
            try
            {
                var discount = await discountProtoService.GetDiscountByProductNameAsync(
                    new GetDiscountRequest { ProductName = item.ProductName },
                    cancellationToken: cancellationToken).ConfigureAwait(false);
                
                decimal discountAmount;
                
                // Pourcentage
                if (discount.Type == DiscountType.Percentage)
                {
                    discountAmount = item.Price * (decimal)discount.Value / 100;
                }
                // Montant fixe
                else
                {
                    discountAmount = (decimal)discount.Value;
                }
                
                var newPrice = item.Price - discountAmount;
                item.Price = newPrice < 0 ? 0 : newPrice;
                item.Code = discount.Code;
                if(!string.IsNullOrEmpty(discount.Code))
                    discountCodes.Add(item.Code);
            }
            catch
            {
                // ignored
            }
        }
        
        var discountTotal = string.Join(",", discountCodes);
        
        var validateResponse = discountProtoService.ValidateDiscountAsync(
            new ValidateDiscountRequest { Code = discountTotal, OrderAmount = (double)basket.Total},
            cancellationToken: cancellationToken).ConfigureAwait(false);
        
        var totalPrice = basket.Items.Sum(i => i.Price);
        
        if (validateResponse.GetAwaiter().GetResult() != null)
        {
            try
            {
                if (validateResponse.GetAwaiter().GetResult().IsValid)
                {
                    var adjustedPercentage = (decimal)validateResponse.GetAwaiter().GetResult().AdjustedDiscountValue;
                    if (adjustedPercentage != 0)
                    {
                        var extraDiscount = totalPrice * adjustedPercentage / 100m;
                        totalPrice -= extraDiscount;
                        if (totalPrice < 0) totalPrice = 0;
                    }
                }
            }
            catch
            {
                // ignored
            }
        }

        try
        {
            var totalProp = basket.GetType().GetProperty("TotalPrice");
            if (totalProp != null && totalProp.CanWrite)
            {
                totalProp.SetValue(basket, totalPrice);
            }
        }
        catch
        {
            // ignored
        }
        
        var eventMessage = request.BasketCheckoutDto.Adapt<BasketCheckoutEvent>();
        eventMessage.TotalPrice = basket.Total;
        
        await publishEndpoint.Publish(eventMessage, cancellationToken).ConfigureAwait(false);
        
        await repository.DeleteBasketAsync(request.BasketCheckoutDto.UserName, cancellationToken).ConfigureAwait(false);
        
        return new CheckOutBasketCommandResult("Your basket have been validated", basket.Total,true);
    }
}