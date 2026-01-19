using Basket.API.DTO;

namespace Basket.API.Services;

/// <summary>
/// Defines operations for retrieving product information
/// from the Catalog API.
/// </summary>
public interface ICatalogService
{
    /// <summary> Retrieves a product by its unique identifier. </summary>
    /// <param name="productId"> The unique identifier of the product. </param>
    /// <param name="cancellationToken"> A token to observe while waiting for the operation to complete. </param>
    /// <returns> The product if found; otherwise, <c>null</c>. </returns>
    Task<CatalogProductDto?> GetProductByIdAsync(Guid productId, CancellationToken cancellationToken);
}
