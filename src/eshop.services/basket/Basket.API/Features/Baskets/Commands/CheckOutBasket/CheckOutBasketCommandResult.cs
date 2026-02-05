namespace Basket.API.Features.Baskets.Commands.CheckOutBasket;

/// <summary>
/// Represents the result of a basket checkout command.
/// </summary>
/// <remarks>
/// This result indicates whether the checkout operation was successful or not.
/// </remarks>
/// <param name="Message">
/// A string message that provides additional information about the checkout operation, such as success or error details.
/// </param>
/// <param name="IsSuccess">
/// A boolean value that specifies the success status of the checkout operation.
/// </param>
public record CheckOutBasketCommandResult(string Message, decimal TotalPrice, bool IsSuccess);