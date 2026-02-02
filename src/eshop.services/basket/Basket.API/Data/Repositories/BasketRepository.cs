using Basket.API.Exceptions;
using Basket.API.Models;
using Marten;

namespace Basket.API.Data.Repositories;

/// <summary>
/// Provides methods to interact with and manage shopping cart data storage.
/// </summary>
public class BasketRepository(IDocumentSession session) : IBasketRepository
{
    /// <summary>
    /// Deletes the shopping cart associated with the specified username.
    /// </summary>
    /// <param name="userName">The username for which the shopping cart needs to be deleted.</param>
    /// <param name="cancellationToken">Optional. A token to cancel the asynchronous operation.</param>
    /// <returns>A boolean indicating whether the deletion was successful.</returns>
    public async Task<bool> DeleteBasketAsync(string userName, CancellationToken cancellationToken = default)
    {
        session.Delete<ShoppingCart>(userName);
        await session.SaveChangesAsync(cancellationToken);
        return true;
    }
    
    /// <summary>
    /// Updates the quantity of a specific item in the user's shopping cart.
    /// </summary>
    public async Task<ShoppingCart> UpdateItemQuantityAsync(string userName, Guid productId, int quantity,
        CancellationToken cancellationToken = default)
    {
        var basket =  await GetBasketByUserNameAsync(userName, cancellationToken);
        var item = basket.Items.FirstOrDefault(i => i.ProductId == productId);
        if (item is null)
            throw new BasketNotFoundException($"Item with ID {productId} not found in the basket for user {userName}.");

        item.Quantity = quantity;
        session.Store(basket);
        await session.SaveChangesAsync(cancellationToken);
        return basket;
    }
    
    /// <summary>
    /// Retrieves the shopping cart for the specified user by their username.
    /// </summary>
    /// <param name="userName">The username for which the shopping cart needs to be retrieved.</param>
    /// <param name="cancellationToken">Optional. A token to cancel the asynchronous operation.</param>
    /// <returns>The shopping cart associated with the specified username, or null if no such cart exists.</returns>
    /// <exception cref="BasketNotFoundException">Thrown when no shopping cart is found for the specified username.</exception>
    public async Task<ShoppingCart> GetBasketByUserNameAsync(string userName,
        CancellationToken cancellationToken = default)
    {
        var basket = await session.LoadAsync<ShoppingCart>(userName, cancellationToken);
        return basket ?? throw new BasketNotFoundException(userName);
    }

    /// <summary>
    /// Creates a new shopping cart for the specified user.
    /// </summary>
    /// <param name="basket">The shopping cart instance to be created, containing the user's details and items.</param>
    /// <param name="cancellationToken">Optional. A token to cancel the asynchronous operation.</param>
    /// <param name="cacheExpiration">An optional timer for products stored in the cache with default set to 3 minute.</param>
    /// <returns>The created shopping cart instance.</returns>
    public async Task<ShoppingCart> CreateBasketAsync(ShoppingCart basket,
        CancellationToken cancellationToken = default, TimeSpan? cacheExpiration = null)
    { 
        session.Store(basket);
        await session.SaveChangesAsync(cancellationToken);
        return basket;
    }
}