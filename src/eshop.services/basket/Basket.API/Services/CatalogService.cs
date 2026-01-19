using Basket.API.DTO;

namespace Basket.API.Services;

using System.Net.Http.Json;

public class CatalogService(HttpClient httpClient) : ICatalogService
{
    
    /// <summary> Retrieves a product by its unique identifier. </summary>
    /// <param name="productId"> The unique identifier of the product. </param>
    /// <param name="cancellationToken"> A token to observe while waiting for the operation to complete. </param>
    /// <returns> The product if found; otherwise, <c>null</c>. </returns>
    public async Task<CatalogProductDto?> GetProductByIdAsync(
        Guid productId,
        CancellationToken cancellationToken)
    {
        var response = await httpClient.GetAsync(
            $"/products/{productId}", cancellationToken);

        if (!response.IsSuccessStatusCode)
            return null;

        return await response.Content
            .ReadFromJsonAsync<CatalogProductDto>(cancellationToken);
    }
}
