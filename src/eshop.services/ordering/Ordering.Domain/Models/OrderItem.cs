using Ordering.Domain.Abstractions;
using Ordering.Domain.ValueObjects.Types;

namespace Ordering.Domain.Models;

/// <summary>
/// Represents an item within an order.
/// This model ties a product to a specific order and contains details about the price and quantity of the product.
/// </summary>
public class OrderItem : Entity<OrderItemId>
{
    public ProductId ProductId { get; private set; }
    public OrderId OrderId { get; private set; }
    public string ProductName { get; private set; } = null!;
    public decimal Price { get; private set; }
    public int Quantity { get; private set; }

    private OrderItem() {}

    internal OrderItem(ProductId productId, OrderId orderId, string productName, decimal price, int quantity)
    {
        Id = OrderItemId.Of(Guid.NewGuid());
        ProductId = productId;
        ProductName = productName;
        OrderId = orderId;
        Price = price;
        Quantity = quantity;
    }
}