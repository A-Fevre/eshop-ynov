using Discount.Grpc.Data;
using Discount.Grpc.Models;
using Grpc.Core;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace Discount.Grpc.Services;

/// <summary>
/// gRPC service responsible for managing discount coupons lifecycle.
/// Provides full CRUD operations, pagination, filtering,
/// and automatic status management (Active, Expired, Disabled, Upcoming).
/// </summary>
/// <remarks>
/// This service uses Entity Framework Core for persistence
/// and Mapster for entity-to-proto mapping.
/// </remarks>
public class DiscountServiceServer(
    DiscountContext dbContext,
    ILogger<DiscountServiceServer> logger)
    : DiscountProtoService.DiscountProtoServiceBase
{
    /// <summary>
    /// Retrieves a discount coupon by its unique code.
    /// </summary>
    /// <param name="request">Request containing the discount code.</param>
    /// <param name="context">gRPC server context.</param>
    /// <returns>The matching <see cref="CouponModel"/>.</returns>
    /// <exception cref="RpcException">Thrown when the coupon does not exist.</exception>
    public override async Task<CouponModel> GetDiscount(GetDiscountRequest request, ServerCallContext context)
    {
        logger.LogInformation("Retrieving discount with code {Code}", request.Code);

        var coupon = await dbContext.Coupons
            .FirstOrDefaultAsync(c =>
                c.Code == request.Code &&
                !c.IsDeleted);

        if (coupon is null)
            throw new RpcException(
                new Status(StatusCode.NotFound,
                    $"Discount with code '{request.Code}' not found"));

        return coupon.Adapt<CouponModel>();
    }

    /// <summary>
    /// Creates a new discount coupon.
    /// </summary>
    /// <param name="request">Request containing coupon data.</param>
    /// <param name="context">gRPC server context.</param>
    /// <returns>The created <see cref="CouponModel"/>.</returns>
    /// <exception cref="RpcException">Thrown when request data is invalid.</exception>
    public override async Task<CouponModel> CreateDiscount(CreateDiscountRequest request, ServerCallContext context)
    {
        if (request.Coupon is null)
            throw new RpcException(
                new Status(StatusCode.InvalidArgument, "Coupon payload is required"));

        var coupon = request.Coupon.Adapt<Coupon>();
        coupon.Status = DiscountStatus.Upcoming;
        coupon.IsDeleted = false;

        logger.LogInformation("Creating discount {Code}", coupon.Code);

        await dbContext.Coupons.AddAsync(coupon);
        await dbContext.SaveChangesAsync();

        return coupon.Adapt<CouponModel>();
    }

    /// <summary>
    /// Updates an existing discount coupon.
    /// </summary>
    /// <param name="request">Request containing updated coupon data.</param>
    /// <param name="context">gRPC server context.</param>
    /// <returns>The updated <see cref="CouponModel"/>.</returns>
    /// <exception cref="RpcException">
    /// Thrown when the coupon does not exist or request is invalid.
    /// </exception>
    public override async Task<CouponModel> UpdateDiscount(UpdateDiscountRequest request, ServerCallContext context)
    {
        if (request.Coupon is null)
            throw new RpcException(
                new Status(StatusCode.InvalidArgument, "Coupon payload is required"));

        var coupon = await dbContext.Coupons
            .FirstOrDefaultAsync(c => c.Id == request.Coupon.Id);

        if (coupon is null)
            throw new RpcException(
                new Status(StatusCode.NotFound, $"Discount with Id {request.Coupon.Id} not found"));

        request.Coupon.Adapt(coupon);

        logger.LogInformation("Updating discount {Code}", coupon.Code);

        await dbContext.SaveChangesAsync();

        return coupon.Adapt<CouponModel>();
    }

    /// <summary>
    /// Soft-deletes a discount coupon (logical deletion).
    /// </summary>
    /// <param name="request">Request containing coupon identifier.</param>
    /// <param name="context">gRPC server context.</param>
    /// <returns>Deletion result.</returns>
    /// <exception cref="RpcException">Thrown when coupon is not found.</exception>
    public override async Task<DeleteDiscountResponse> DeleteDiscount(DeleteDiscountRequest request, ServerCallContext context)
    {
        if (request.Coupon is null)
            throw new RpcException(
                new Status(StatusCode.InvalidArgument, "Coupon is required"));

        var coupon = await dbContext.Coupons
            .FirstOrDefaultAsync(c =>
                c.Id == request.Coupon.Id &&
                !c.IsDeleted);

        if (coupon is null)
            throw new RpcException(
                new Status(StatusCode.NotFound,
                    $"Discount with Id {request.Coupon.Id} not found"));

        coupon.IsDeleted = true;
        coupon.Status = DiscountStatus.Disabled;

        logger.LogInformation("Disabling discount {Code}", coupon.Code);

        await dbContext.SaveChangesAsync();

        return new DeleteDiscountResponse { Success = true };
    }

    /// <summary>
    /// Updates discount statuses automatically based on start and end dates.
    /// Should be executed periodically or at application startup.
    /// </summary>
    public async Task UpdateStatusesAsync()
    {
        var now = DateTime.UtcNow;

        var coupons = await dbContext.Coupons.ToListAsync();

        foreach (var coupon in coupons)
        {
            if (coupon.IsDeleted || coupon.Status == DiscountStatus.Disabled)
                continue;

            coupon.Status =
                now < coupon.StartDate ? DiscountStatus.Upcoming :
                now > coupon.EndDate ? DiscountStatus.Expired :
                DiscountStatus.Active;
        }

        await dbContext.SaveChangesAsync();
    }
    
    public override async Task<ValidateDiscountResponse> ValidateDiscount(ValidateDiscountRequest request, ServerCallContext context)
    {
        var coupon = await dbContext.Coupons
            .FirstOrDefaultAsync(c => c.Code == request.Code && !c.IsDeleted);

        if (coupon == null || coupon.Status != DiscountStatus.Active)
        {
            return new ValidateDiscountResponse { IsValid = false, Message = "Coupon invalide ou expiré." };
        }
        
        if (!coupon.AllowOnSaleItems && request.IsProductAlreadyDiscounted)
        {
            return new ValidateDiscountResponse 
            { 
                IsValid = false, 
                Message = "Ce coupon ne peut pas être appliqué sur des articles déjà en promotion." 
            };
        }

        double currentDiscount = request.CurrentAppliedDiscountPercentage;
        double getPercentValue = coupon.Type == DiscountType.FixedAmount ? coupon.Value * request.OrderAmount / 100 : coupon.Value;
        double newTotalDiscount = currentDiscount + getPercentValue;

        if (newTotalDiscount > coupon.MaxCumulativePercentage)
        {
            logger.LogWarning("Plafonnement appliqué pour le code {Code}. Tentative: {Attempt}%, Max: {Max}%", 
                coupon.Code, newTotalDiscount, coupon.MaxCumulativePercentage);
            
            return new ValidateDiscountResponse 
            { 
                IsValid = true, 
                AdjustedDiscountValue = coupon.MaxCumulativePercentage - currentDiscount,
                Message = "La remise a été limitée au plafond maximum autorisé."
            };
        }
        
        if (request.OrderAmount < coupon.MinimumOrderAmount)
        {
            return new ValidateDiscountResponse { 
                IsValid = false, 
                Message = $"Le montant minimum de commande de {coupon.MinimumOrderAmount} n'est pas atteint." 
            };
        }
        
        double adjustedValue = coupon.Value;
        if (newTotalDiscount > coupon.MaxCumulativePercentage)
        {
            adjustedValue = Math.Max(0, coupon.MaxCumulativePercentage - currentDiscount);
        }

        return new ValidateDiscountResponse { IsValid = true, AdjustedDiscountValue = coupon.Value };
    }
}
