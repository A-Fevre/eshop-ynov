using Basket.API.Models;
using BuildingBlocks.CQRS;

namespace Basket.API.Features.Baskets.Commands.UpdateBasket;

/// <summary>
/// Represents a command to update a user's basket item based on the provided username and shopping cart item.
/// </summary>
/// <remarks>
/// This command is used within the CQRS pattern and implements the ICommand interface with a response type of DeleteBasketCommandResult.
/// </remarks>
/// <param name="Username"></param>
public record UpdateBasketCommand(string Username, ShoppingCartItem? Items) : ICommand<UpdateBasketCommandResult>;