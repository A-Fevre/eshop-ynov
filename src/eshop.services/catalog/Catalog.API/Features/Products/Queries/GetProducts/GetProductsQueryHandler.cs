using BuildingBlocks.CQRS;
using BuildingBlocks.Pagination;
using Catalog.API.Models;
using Discount.Grpc;
using Marten;

namespace Catalog.API.Features.Products.Queries.GetProducts;

/// <summary>
/// Handles the execution of the <see cref="GetProductsQuery"/> and retrieves the corresponding
/// list of products data from the data store.
/// </summary>
/// <remarks>
/// This class interacts with the database session to load a list of paginated products.
/// </remarks>
public class GetProductsQueryHandler(IDocumentSession documentSession, DiscountProtoService.DiscountProtoServiceClient discountProtoService) : IQueryHandler<GetProductsQuery, GetProductsQueryResult>
{
    /// <summary>
    /// Handles the execution of the GetProductsQuery and retrieves the associated list of products data.
    /// </summary>
    /// <param name="request">The query containing the PageNumber and PageSize for the paginated list of products to be retrieved.</param>
    /// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
    /// <returns>A task that represents the asynchronous operation, containing the result of the query, including the product data.</returns>
    public async Task<GetProductsQueryResult> Handle(GetProductsQuery request,
        CancellationToken cancellationToken)
    {
        var pageNumber = request.PageNumber < 1 ? 1 : request.PageNumber;
        var pageSize = request.PageSize < 1 ? 10 : request.PageSize;

        var baseQuery = documentSession.Query<Product>();

        var totalCount = await baseQuery.CountAsync(cancellationToken);

        var products = await baseQuery
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
        
        foreach (var product in products)
        {
            try
            {
                var discount = await discountProtoService.GetDiscountByProductNameAsync(
                    new GetDiscountRequest { ProductName = product.Name },
                    cancellationToken: cancellationToken).ConfigureAwait(false);
                product.Discount = discount;
            }
            catch
            {
                product.Discount = null;
            }
        }

        var paginated = new PaginatedResult<Product>(pageNumber, pageSize, totalCount, products);

        return new GetProductsQueryResult(paginated);
    }
}
