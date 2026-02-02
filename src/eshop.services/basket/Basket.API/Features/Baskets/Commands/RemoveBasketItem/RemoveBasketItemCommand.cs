using BuildingBlocks.CQRS;

namespace Basket.API.Features.Baskets.Commands.RemoveBasketItem;

/// <summary>
/// Represents a command to remove an item from a user's basket by product ID.
/// </summary>
/// <remarks>
/// This command is used within the CQRS pattern and implements the ICommand interface with a response type of RemoveBasketItemCommandResult.
/// </remarks>
/// <param name="UserName">The username associated with the basket.</param>
/// <param name="ProductId">The product ID of the item to remove from the basket.</param>
public record RemoveBasketItemCommand(string UserName, Guid ProductId) : ICommand<RemoveBasketItemCommandResult>;
