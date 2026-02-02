using FluentValidation;

namespace Basket.API.Features.Baskets.Commands.RemoveBasketItem;

/// <summary>
/// Validator for the <see cref="RemoveBasketItemCommand"/>.
/// </summary>
/// <remarks>
/// This class is responsible for defining the validation logic for the <see cref="RemoveBasketItemCommand"/>.
/// It ensures that the required fields in the command are properly validated before execution.
/// </remarks>
public class RemoveBasketItemCommandValidator : AbstractValidator<RemoveBasketItemCommand>
{
    public RemoveBasketItemCommandValidator()
    {
        RuleFor(x => x.UserName).NotEmpty().WithMessage("UserName is required");
        RuleFor(x => x.ProductId).NotEmpty().WithMessage("ProductId is required");
    }
}
