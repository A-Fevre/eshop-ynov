using Basket.API.Data.Repositories;
using Basket.API.Models;
using BuildingBlocks.CQRS;

namespace Basket.API.Features.Baskets.Commands.RemoveBasketItem;

/// <summary>
/// Handles the execution of the <see cref="RemoveBasketItemCommand"/> to remove an item from a user's shopping basket.
/// </summary>
/// <remarks>
/// Implements the <see cref="ICommandHandler{TCommand, TResponse}"/> interface to process the command within the CQRS architecture.
/// Retrieves the basket, removes all items matching the product ID, and persists the updated basket via CreateBasketAsync (Marten upsert).
/// </remarks>
public class RemoveBasketItemCommandHandler(IBasketRepository repository)
    : ICommandHandler<RemoveBasketItemCommand, RemoveBasketItemCommandResult>
{
    /// <summary>
    /// Processes the request to remove an item from the user's basket.
    /// </summary>
    /// <param name="request">The <see cref="RemoveBasketItemCommand"/> containing the user name and product ID.</param>
    /// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
    /// <returns>The updated shopping cart after the item removal.</returns>
    public async Task<RemoveBasketItemCommandResult> Handle(RemoveBasketItemCommand request,
        CancellationToken cancellationToken)
    {
        var basket = await repository.GetBasketByUserNameAsync(request.UserName, cancellationToken)
            .ConfigureAwait(false);

        var items = basket.Items.ToList();
        items.RemoveAll(i => i.ProductId == request.ProductId);
        basket.Items = items;

        var updated = await repository.CreateBasketAsync(basket, cancellationToken).ConfigureAwait(false);

        return new RemoveBasketItemCommandResult(updated);
    }
}
