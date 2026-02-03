using Discount.Grpc.Models.Enums;

namespace Discount.Grpc.Models;

public class Coupon
{
    public int Id { get; set; }

    public string Code { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DiscountType Type { get; set; }

    public double Value { get; set; }

    public double MinimumOrderAmount { get; set; }

    public bool IsCumulative { get; set; }

    public DiscountStatus Status { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public bool IsDeleted { get; set; }
}