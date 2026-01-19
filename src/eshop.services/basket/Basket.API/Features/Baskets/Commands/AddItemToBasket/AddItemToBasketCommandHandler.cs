using Basket.API.Features.Baskets.Commands.AddItemToBasket;
using Basket.API.Services;
using BuildingBlocks.Exceptions;

namespace Basket.API.Features.Baskets.Commands.AddItemToBasket;

using Basket.API.Data.Repositories;
using Basket.API.Models;
using BuildingBlocks.CQRS;

/// <summary>
/// Handles the <see cref="AddItemToBasketCommand"/> by validating the product
/// through the Catalog API and updating the user's shopping basket.
/// </summary>
public class AddItemToBasketCommandHandler(IBasketRepository basketRepository, ICatalogService catalogService) : ICommandHandler<AddItemToBasketCommand, AddItemToBasketResult>
{
    /// <summary> Processes the command to add a product to a shopping basket. </summary>
    /// <param name="request"> The command containing user, product, and quantity information. </param>
    /// <param name="cancellationToken"> A token to observe while waiting for the operation to complete. </param>
    /// <returns> A result indicating whether the operation succeeded. </returns>
    /// <exception cref="Exception"> Thrown when the product does not exist in the Catalog service. </exception>
    public async Task<AddItemToBasketResult> Handle(AddItemToBasketCommand request, CancellationToken cancellationToken)
    {
        var product = await catalogService
            .GetProductByIdAsync(request.ProductId, cancellationToken);

        if (product is null)
            throw new NotFoundException($"Product {request.ProductId} not found");

        ShoppingCart basket;
        try
        {
            basket = await basketRepository
                .GetBasketByUserNameAsync(request.UserName, cancellationToken);
        }
        catch
        {
            basket = new ShoppingCart(request.UserName);
        }

        var items = basket.Items.ToList();

        var existingItem = items
            .FirstOrDefault(i => i.ProductId == request.ProductId && i.Color == request.Color);

        if (existingItem is not null)
        {
            existingItem.Quantity += request.Quantity;
        }
        else
        {
            items.Add(new ShoppingCartItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Price = product.Price,
                Color = request.Color,
                Quantity = request.Quantity
            });
        }

        basket.Items = items;

        await basketRepository.CreateBasketAsync(basket, cancellationToken);

        return new AddItemToBasketResult(true);
    }
}
