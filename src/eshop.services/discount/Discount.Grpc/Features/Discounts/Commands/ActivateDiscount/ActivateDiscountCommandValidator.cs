using FluentValidation;

namespace Discount.Grpc.Features.Discounts.Commands.ActivateDiscount;

/// <summary>
/// Validateur pour la commande ActivateDiscountCommand.
/// </summary>
public class ActivateDiscountCommandValidator : AbstractValidator<ActivateDiscountCommand>
{
    public ActivateDiscountCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("Le code du coupon est requis.");
    }
}
