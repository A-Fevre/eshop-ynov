namespace Basket.API.Features.Baskets.Commands.AddItemToBasket;

using FluentValidation;

/// <summary>
/// Validator for the <see cref="AddItemToBasketCommand"/> class used to validate the data integrity of the command.
/// </summary>
/// <remarks>
/// Ensures that the required properties of the <see cref="AddItemToBasketCommand"/> are properly populated before processing.
/// Performs validation checks on the <see cref="ShoppingCart"/> instance, including:
/// - Ensuring that the cart object itself is not null.
/// - Validating that the <see cref="ShoppingCart.UserName"/> is not empty.
/// - Validating that the <see cref="ShoppingCart.ProductId"/> is not empty.
/// - Validating that the <see cref="ShoppingCart.Quantity"/> is greater than 0.
/// </remarks>
public class AddItemToBasketCommandValidator : AbstractValidator<AddItemToBasketCommand>
{
    public AddItemToBasketCommandValidator()
    {
        RuleFor(x => x.UserName).NotEmpty();
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
    }
}