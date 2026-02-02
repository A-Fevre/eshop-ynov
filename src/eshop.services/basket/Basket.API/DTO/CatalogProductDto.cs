namespace Basket.API.DTO;

/// <summary> Represents a product returned by the Catalog API. </summary>
/// <param name="Id"> The unique identifier of the product. </param>
/// <param name="Name"> The display name of the product. </param>
/// <param name="Price"> The price of the product. </param>
/// <param name="Color"> The color of the product. </param>
public record CatalogProductDto(
    Guid Id,
    string Name,
    decimal Price,
    string Color
);