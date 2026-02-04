using Discount.Grpc.Models;
using Discount.Grpc.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Discount.Grpc.Data;

public sealed class DiscountContext(DbContextOptions<DiscountContext> options) : DbContext(options)
{
    public DbSet<Coupon> Coupons { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Coupon>()
            .ToTable("Coupon")
            .HasQueryFilter(c => !c.IsDeleted);

        modelBuilder.Entity<Coupon>().HasData(
            new Coupon
            {
                Id = 1,
                ProductName = "IPhone X",
                Code = "WELCOME10",
                Description = "Bienvenue",
                Type = DiscountType.Percentage,
                Value = 10,
                MinimumOrderAmount = 50,
                IsCumulative = false,
                Status = DiscountStatus.Active,
                StartDate = new DateTime(2026, 01, 01, 0, 0, 0, DateTimeKind.Utc),
                EndDate   = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                IsDeleted = false
            },
            new Coupon
            {
                Id = 2,
                ProductName = "IPhone X",
                Code = "WELCOME20",
                Description = "Bienvenue",
                Type = DiscountType.FixedAmount,
                Value = 10,
                MinimumOrderAmount = 50,
                IsCumulative = false,
                Status = DiscountStatus.Active,
                StartDate = new DateTime(2026, 01, 01, 0, 0, 0, DateTimeKind.Utc),
                EndDate   = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                IsDeleted = false
            }
        );
    }

}