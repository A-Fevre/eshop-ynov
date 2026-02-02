using Basket.API.Models;

namespace Basket.API.Features.Baskets.Commands.RemoveBasketItem;

/// <summary>
/// Result of the remove basket item operation, containing the updated shopping cart.
/// </summary>
/// <param name="UpdatedCart">The basket after the item(s) have been removed.</param>
public record RemoveBasketItemCommandResult(ShoppingCart UpdatedCart);
