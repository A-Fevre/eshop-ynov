using Basket.API.Data.Repositories;
using BuildingBlocks.CQRS;

namespace Basket.API.Features.Baskets.Commands.RemoveBasketItem;

/// <summary>
/// Handles the execution of the <see cref="RemoveBasketItemCommand"/> to remove an item from a user's basket.
/// </summary>
public class RemoveBasketItemCommandHandler(IBasketRepository repository)
    : ICommandHandler<RemoveBasketItemCommand, RemoveBasketItemCommandResult>
{
    /// <summary>
    /// Processes the request to remove the specified product from the user's basket.
    /// </summary>
    public async Task<RemoveBasketItemCommandResult> Handle(RemoveBasketItemCommand request,
        CancellationToken cancellationToken)
    {
        var basket = await repository.GetBasketByUserNameAsync(request.UserName, cancellationToken)
            .ConfigureAwait(false);

         basket.Items = basket.Items.Where(i => i.ProductId != request.ProductId).ToList();


        var updated = await repository.CreateBasketAsync(basket, cancellationToken)
            .ConfigureAwait(false);

        return new RemoveBasketItemCommandResult(updated);
    }
}
