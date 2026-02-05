using FluentValidation;

namespace Ordering.Application.Features.Orders.Commands.UpdateOrderStatus;

public class UpdateOrderStatusCommandValidator : AbstractValidator<UpdateOrderStatusCommand>
{
    public UpdateOrderStatusCommandValidator()
    {
        RuleFor(x => x.Status).IsInEnum();
        RuleFor(x => x.OrderId).NotEmpty().WithMessage("Order Id is required");
    }
}