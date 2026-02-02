using Basket.API.Models;

namespace Basket.API.Features.Baskets.Commands.RemoveBasketItem;

/// <summary>
/// Represents the result of removing an item from a user's basket.
/// </summary>
/// <param name="UpdatedCart">The shopping cart after the item(s) have been removed.</param>
public record RemoveBasketItemCommandResult(ShoppingCart UpdatedCart);
