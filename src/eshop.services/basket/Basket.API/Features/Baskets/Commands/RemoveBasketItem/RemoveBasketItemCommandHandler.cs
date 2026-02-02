using Basket.API.Data.Repositories;
using Basket.API.Models;
using BuildingBlocks.CQRS;

namespace Basket.API.Features.Baskets.Commands.RemoveBasketItem;

/// <summary>
/// Handles the removal of item(s) from a user's basket by product ID.
/// </summary>
public class RemoveBasketItemCommandHandler(IBasketRepository repository)
    : ICommandHandler<RemoveBasketItemCommand, RemoveBasketItemCommandResult>
{
    public async Task<RemoveBasketItemCommandResult> Handle(RemoveBasketItemCommand request,
        CancellationToken cancellationToken)
    {
        var basket = await repository.GetBasketByUserNameAsync(request.UserName, cancellationToken)
            .ConfigureAwait(false);

        var items = basket.Items.ToList();
        items.RemoveAll(i => i.ProductId == request.ProductId);
        basket.Items = items;

        var updated = await repository.CreateBasketAsync(basket, cancellationToken)
            .ConfigureAwait(false);

        return new RemoveBasketItemCommandResult(updated);
    }
}
