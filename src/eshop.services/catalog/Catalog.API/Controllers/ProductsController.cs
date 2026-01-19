using Catalog.API.Features.Products.Commands.CreateProduct;
using Catalog.API.Features.Products.Commands.ImportProduct;
using Catalog.API.Features.Products.Commands.UpdateProduct;
using Catalog.API.Features.Products.Commands.DeleteProduct;
using Catalog.API.Features.Products.Queries.GetProductByCategory;
using Catalog.API.Features.Products.Queries.GetProductById;
using Catalog.API.Features.Products.Queries.GetProducts;
using Catalog.API.Models;
using Ganss.Excel;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using BuildingBlocks.Pagination;

namespace Catalog.API.Controllers;

/// <summary>
/// Manages operations related to products within the catalog, including retrieving product data
/// and creating new products.
/// </summary>
[ApiController]
[Route("[controller]")]
[Produces("application/json")]
public class ProductsController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Retrieves a product by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the product to retrieve.</param>
    /// <returns>The product matching the specified identifier, if found; otherwise, a not found response.</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(Product), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(NotFoundObjectResult), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Product>> GetProductById(Guid id)
    {
        var result = await sender.Send(new GetProductByIdQuery(id));
        return Ok(result.Product);

    }

    /// <summary>
    /// Retrieves a collection of products within a specified category (supports pagination).
    /// </summary>
    /// <param name="category">The category by which to filter the products.</param>
    /// <param name="pageNumber">Page number (1-based). Defaults to 1 if not provided or invalid.</param>
    /// <param name="pageSize">Page size (number of items per page). Defaults to 10 if not provided or invalid.</param>
    /// <returns>A paginated result of products belonging to the specified category.</returns>
    [HttpGet("category")]
    [ProducesResponseType(typeof(PaginatedResult<Product>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(BadRequestObjectResult), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PaginatedResult<Product>>> GetProductsByCategory(
        [FromQuery] string category,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        if (string.IsNullOrWhiteSpace(category))
            return BadRequest("Category is required");

        var result = await sender.Send(new GetProductByCategoryQuery(category, pageNumber, pageSize));
        return Ok(result.Result);
    }

    /// <summary>
    /// Retrieves a collection of products from the catalog.
    /// </summary>
    /// <returns>A collection of products wrapped in an action result (supports pagination).</returns>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResult<Product>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<Product>>> GetProducts(
        [FromQuery] int pageNumber = 1
       , [FromQuery] int pageSize = 10)
    {
        var result = await sender.Send(new GetProductsQuery(pageNumber, pageSize));
        return Ok(result.Result);
    }

    /// <summary>
    /// Handles the creation of a new product.
    /// </summary>
    /// <param name="request">The command containing the details of the product to be created.</param>
    /// <returns>A result object containing the ID of the newly created product.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(CreateProductCommandResult), StatusCodes.Status201Created)]
    public async Task<ActionResult<CreateProductCommandResult>> CreateProduct(CreateProductCommand request)
    {
        var result = await sender.Send(request);
        return CreatedAtAction(nameof(GetProductById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Updates a product with the specified ID using the provided update details.
    /// </summary>
    /// <param name="id">The unique identifier of the product to update.</param>
    /// <param name="request">The details to update the specified product.</param>
    /// <returns>A boolean indicating whether the update was successful or an appropriate error response if the product was not found.</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(NotFoundObjectResult), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<bool>> UpdateProduct(Guid id, [FromBody] UpdateProductCommand request)
    {
        var result = await sender.Send(request);
        return Ok(result.IsSuccessful);
    }

    /// <summary>
    /// Deletes a product by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the product to delete.</param>
    /// <returns>True if the product was successfully deleted; otherwise, a not found response.</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(NotFoundObjectResult), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<bool>> DeleteProduct(Guid id)
    {
        var result = await sender.Send(new DeleteProductCommand(id));
        return Ok(result.IsSuccessful);
    }

    /// <summary>
    /// Retrieves products from xlsx files.
    /// </summary>
    /// <returns>A collection of products wrapped in an action result.</returns>
    [HttpPost("import")]
    [ProducesResponseType(typeof(IEnumerable<Product>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ImportProductCommandResult), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ImportProductCommandResult>> ImportProductFromExcel(IFormFile file)
    {
        var result = await sender.Send(new ImportProductCommand(file));
        if (result.isSuccessful) return Ok(result);
        return BadRequest(result.errors);
    }
    
    /// <summary>
    /// Retrieves products from xlsx files.
    /// </summary>
    /// <returns>A collection of products wrapped in an action result.</returns>
    ///
    [HttpGet("export")]
    public async Task<IActionResult> ExportProduct()
    {
        var products = await sender.Send(new GetProductsQuery(1, int.MaxValue));
        
        var exportData = products.Result.Data.Select(p => new
        {
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            ImageFile = p.ImageFile,
            Categories = string.Join(", ", p.Categories)
        }).ToList();

        // Create Excel file in memory
        var mapper = new ExcelMapper();
    
        using var stream = new MemoryStream();
        mapper.Save(stream, exportData, "Products");
        stream.Position = 0;
    
        var fileName = $"products_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
        
        return File(
            stream.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileName
        );
    }
}