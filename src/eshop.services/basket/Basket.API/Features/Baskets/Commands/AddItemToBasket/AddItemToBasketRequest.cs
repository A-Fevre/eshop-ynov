namespace Basket.API.Features.Baskets.Commands.AddItemToBasket;

/// <summary> Represents the request payload used to add a product to a user's shopping basket. </summary>
/// <param name="ProductId"> The unique identifier of the product to be added to the basket. </param>
/// <param name="Quantity"> The quantity of the product to add. Must be greater than zero. </param>
/// <param name="Color"> The color of the product to add. If different from the color of same product in basket, add as a different product</param>
public record AddItemToBasketRequest(Guid ProductId, int Quantity, string Color);