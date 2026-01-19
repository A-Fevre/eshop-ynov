using BuildingBlocks.CQRS;

namespace Basket.API.Features.Baskets.Commands.AddItemToBasket;

/// <summary> Command used to add a product item to a user's shopping basket. </summary>
/// <param name="UserName"> The username that identifies the shopping basket. </param>
/// <param name="ProductId"> The unique identifier of the product to add. </param>
/// <param name="Quantity"> The quantity of the product to add. </param>
public record AddItemToBasketCommand(string UserName, Guid ProductId, int Quantity, string Color) : ICommand<AddItemToBasketResult>;