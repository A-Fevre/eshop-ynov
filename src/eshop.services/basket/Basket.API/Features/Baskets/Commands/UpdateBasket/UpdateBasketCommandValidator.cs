using FluentValidation;

namespace Basket.API.Features.Baskets.Commands.UpdateBasket;

/// <summary>
/// Validator for the <see cref="UpdateBasketCommand"/>.
/// </summary>
/// <remarks>
/// This class is responsible for defining the validation logic for the <see cref="UpdateBasketCommand"/>.
/// It ensures that the required fields in the command are properly validated before execution.
/// </remarks>
public class UpdateBasketCommandValidator : AbstractValidator<UpdateBasketCommand>
{
    public UpdateBasketCommandValidator()
    {
        RuleFor(x => x.Username).NotEmpty().WithMessage("Username is required");
        RuleFor(x => x.Items!.ProductId).NotEmpty().WithMessage("ProductId is required");
        RuleFor(x => x.Items!.Quantity).GreaterThan(0).WithMessage("Quantity must be greater than zero");
        RuleFor(x => x.Items!.Price).GreaterThanOrEqualTo(0).WithMessage("Price must be greater than or equal to zero");
        RuleFor(x => x.Items!.ProductName).NotEmpty().WithMessage("ProductName is required");
        RuleFor(x => x.Items!.Color).NotEmpty().WithMessage("Color is required");
    }
}