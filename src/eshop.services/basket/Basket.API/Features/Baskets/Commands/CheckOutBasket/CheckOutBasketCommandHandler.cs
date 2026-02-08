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
        var basket = await repository.GetBasketByUserNameAsync(
            request.BasketCheckoutDto.UserName,
            cancellationToken
        ).ConfigureAwait(false);
        
        var totalPrice = basket.TotalSavings;
        List<double> totalPercentageCode = [];
        
        var itemsWithDiscount = basket.Items
            .Where(item => !string.IsNullOrEmpty(item.Code))
            .ToList();
        
        foreach (var item in itemsWithDiscount)
        {
            var discount = await discountProtoService.GetDiscountByProductNameAsync(new GetDiscountRequest
                { ProductName = item.ProductName }, cancellationToken: cancellationToken);
            
            try 
            {
                if (discount is null) continue;
                
                switch (discount.Type)
                {
                    case DiscountType.Percentage:
                        totalPercentageCode.Add(discount.Value);
                        break;
                    case DiscountType.FixedAmount:
                    {
                        var percentage = discount.Value * 100 / (double)item.Price;
                        totalPercentageCode.Add(percentage);
                        break;
                    }
                }
            }
            catch
            {
                // ignored
            }
        }
        var totalPercentage = totalPercentageCode.Sum();
        
        var validateTask = discountProtoService.ValidateDiscountAsync(
            new ValidateDiscountRequest { OrderAmount = (double)basket.TotalSavings, CurrentAppliedDiscountPercentage = totalPercentage},
            cancellationToken: cancellationToken);
        
        var validateResponse = validateTask.GetAwaiter().GetResult();
        
        switch (validateResponse)
        {
            case { IsValid: true, AdjustedDiscountValue: > 0 }:
                try
                {
                    var adjustedPercentage = (decimal)validateResponse.AdjustedDiscountValue;
                    if (adjustedPercentage != 0)
                    {
                        var extraDiscount = totalPrice * adjustedPercentage / 100m;
                        totalPrice -= extraDiscount;
                        if (totalPrice < 0) totalPrice = 0;
                    }
                }
                catch
                {
                    // ignored
                }

                break;
            case { IsValid: false }:
                return new CheckOutBasketCommandResult(validateResponse.Message, totalPrice, false);
        }
        
        var eventMessage = request.BasketCheckoutDto.Adapt<BasketCheckoutEvent>();
        eventMessage.TotalPrice = totalPrice;
        
        await publishEndpoint.Publish(eventMessage, cancellationToken).ConfigureAwait(false);
        
        await repository.DeleteBasketAsync(request.BasketCheckoutDto.UserName, cancellationToken).ConfigureAwait(false);
        
        return new CheckOutBasketCommandResult($"Your basket have been validated and applied {validateResponse.AdjustedDiscountValue:0.##}% on your basket !", totalPrice,true);
    }
}