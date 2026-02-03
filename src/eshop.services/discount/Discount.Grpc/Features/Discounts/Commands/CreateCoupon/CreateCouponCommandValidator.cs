using FluentValidation;

namespace Discount.Grpc.Features.Discounts.Commands.CreateCoupon;

/// <summary>
/// Validateur pour la commande CreateCouponCommand.
/// </summary>
public class CreateCouponCommandValidator : AbstractValidator<CreateCouponCommand>
{
    public CreateCouponCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("Le code du coupon est requis.");

        RuleFor(x => x.Description)
            .NotEmpty()
            .WithMessage("La description du coupon est requise.");

        RuleFor(x => x.Value)
            .GreaterThan(0)
            .WithMessage("La valeur du coupon doit être supérieure à 0.");

        RuleFor(x => x.MinimumOrderAmount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Le montant minimum de commande doit être supérieur ou égal à 0.");

        RuleFor(x => x.StartDate)
            .LessThan(x => x.EndDate)
            .WithMessage("La date de début doit être antérieure à la date de fin.");
    }
}
