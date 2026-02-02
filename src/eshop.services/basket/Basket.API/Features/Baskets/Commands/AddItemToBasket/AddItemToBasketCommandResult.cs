namespace Basket.API.Features.Baskets.Commands.AddItemToBasket;

/// <summary> Represents the result of adding an item to the shopping basket. </summary>
/// <param name="IsSuccess"> Indicates whether the item was successfully added to the basket. </param>
public record AddItemToBasketResult(bool IsSuccess);
