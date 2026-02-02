using Basket.API.Models;

namespace Basket.API.Features.Baskets.Commands.RemoveBasketItem;

/// <summary>
/// Represents the result of executing the RemoveBasketItemCommand.
/// </summary>
/// <remarks>
/// This record contains the updated shopping cart after the item removal, allowing the client to refresh the basket state.
/// </remarks>
/// <param name="UpdatedCart">The shopping cart after the item(s) matching the product ID have been removed.</param>
public record RemoveBasketItemCommandResult(ShoppingCart UpdatedCart);
