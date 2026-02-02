using FluentValidation;

namespace Basket.API.Features.Baskets.Commands.RemoveBasketItem;

/// <summary>
/// Validator for <see cref="RemoveBasketItemCommand"/>.
/// </summary>
public class RemoveBasketItemCommandValidator : AbstractValidator<RemoveBasketItemCommand>
{
    public RemoveBasketItemCommandValidator()
    {
        RuleFor(x => x.UserName).NotEmpty().WithMessage("UserName is required");
        RuleFor(x => x.ProductId).NotEmpty().WithMessage("ProductId is required");
    }
}
