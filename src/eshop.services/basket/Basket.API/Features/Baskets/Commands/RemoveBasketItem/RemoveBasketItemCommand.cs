using BuildingBlocks.CQRS;

namespace Basket.API.Features.Baskets.Commands.RemoveBasketItem;

/// <summary>
/// Command to remove one or more items from a user's basket by product ID.
/// </summary>
/// <param name="UserName">The username whose basket is to be updated.</param>
/// <param name="ProductId">The product ID of the item(s) to remove.</param>
public record RemoveBasketItemCommand(string UserName, Guid ProductId) : ICommand<RemoveBasketItemCommandResult>;
