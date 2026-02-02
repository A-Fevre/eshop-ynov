using Basket.API.Features.Baskets.Commands.AddItemToBasket;
using Basket.API.Features.Baskets.Commands.CreateBasket;
using Basket.API.Features.Baskets.Commands.DeleteBasket;
using Basket.API.Features.Baskets.Commands.UpdateBasket;
using Basket.API.Features.Baskets.Commands.RemoveBasketItem;
using Basket.API.Features.Baskets.Queries.GetBasketByUserName;
using Basket.API.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Basket.API.Controllers;

/// <summary>
/// The BasketsController is responsible for handling HTTP requests related to user baskets in the basket service.
/// It provides endpoints to retrieve the shopping basket for a specific user.
/// </summary>
[ApiController]
[Route("[controller]/{userName}")]
[Produces("application/json")]
public class BasketsController (ISender sender) : ControllerBase
{
    /// <summary>
    /// Retrieves the shopping basket for the specified user.
    /// </summary>
    /// <param name="userName">The username whose shopping basket is to be retrieved.</param>
    /// <returns>The shopping basket associated with the specified username or a not-found response if no basket exists.</returns>
    /// <response code="200">The shopping basket was successfully retrieved.</response>
    /// <response code="404">The basket does not exist for the specified user.</response>
    [HttpGet]
    [ProducesResponseType(typeof(ShoppingCart), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(NotFoundObjectResult), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ShoppingCart>> GetBasketByUserName(string userName)
    {
        var result = await sender.Send(new GetBasketByUserNameQuery(userName));
        return Ok(result.ShoppingCart);
    }

    /// <summary>
    /// Creates a shopping basket for the specified user based on the given request data.
    /// </summary>
    /// <param name="userName">The username for whom the shopping basket is to be created.</param>
    /// <param name="request">The request containing the details of the shopping basket to be created.</param>
    /// <returns>The result of the create basket operation, including success status and associated username.</returns>
    /// <response code="201">The shopping basket was successfully created.</response>
    [HttpPost]
    [ProducesResponseType(typeof(CreateBasketCommandResult), StatusCodes.Status201Created)]
    public async Task<ActionResult<CreateBasketCommandResult>> CreateBasket(string userName, [FromBody] CreateBasketCommand request)
    {
        var result = await sender.Send(request);
        return CreatedAtAction(nameof(GetBasketByUserName), new { userName }, result);
    }

    /// <summary>
    /// Removes an item from the shopping basket for the specified user by product ID.
    /// </summary>
    /// <param name="userName">The username whose basket is to be updated.</param>
    /// <param name="productId">The product ID of the item to remove.</param>
    /// <returns>The updated shopping cart or a not-found response if no basket exists for the user.</returns>
    /// <response code="200">The item was successfully removed from the basket.</response>
    /// <response code="400">Invalid request (userName or productId invalid).</response>
    /// <response code="404">The basket does not exist for the specified user.</response>
    [HttpDelete("items/{productId:guid}")]
    [ProducesResponseType(typeof(ShoppingCart), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(NotFoundObjectResult), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ShoppingCart>> RemoveBasketItem(string userName, Guid productId)
    {
        var result = await sender.Send(new RemoveBasketItemCommand(userName, productId));
        return Ok(result.UpdatedCart);
    }

    /// <summary>
    /// Deletes the shopping basket for the specified user.
    /// </summary>
    /// <param name="userName">The username whose shopping basket is to be deleted.</param>
    /// <returns>A boolean value indicating whether the basket was successfully deleted or a not-found response if no basket exists for the user.</returns>
    /// <response code="200">The shopping basket was successfully deleted.</response>
    /// <response code="404">The basket does not exist for the specified user.</response>
    [HttpDelete]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(NotFoundObjectResult), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<bool>> DeleteBasket(string userName)
    {
        var result = await sender.Send(new DeleteBasketCommand(userName));
        return Ok(result.IsSuccess);
    }
    
    /// <summary>
    /// Updates the quantity of a specific item in the user's shopping basket.
    /// <param name="userName"></param>
    /// <param name="request"></param>
    /// <returns>A boolean value indicating whether the item quantity was successfully updated or a not-found response if no basket exists for the user.</returns>
    /// </summary>
    /// <response code="200">Item quantity updated successfully.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="404">Basket or item not found.</response>
    [HttpPut]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(NotFoundObjectResult), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<bool>> UpdateItemQuantity(string userName, [FromBody] UpdateBasketCommand request)
    {
        var command = request with { Username = userName };
        var result = await sender.Send(command);
       return Ok(result);
    }
    
    /// <summary> Adds a product item to the user's shopping basket.</summary>
    /// <param name="userName"> The username identifying the shopping basket. </param>
    /// <param name="request"> The product identifier and quantity to add to the basket. </param>
    /// <response code="200"> The product was successfully added to the basket. </response>
    /// <response code="400"> Invalid request payload. </response>
    /// <response code="404"> The product does not exist in the Catalog service. </response>
    [HttpPost("items")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> AddItemToBasket(
        string userName,
        [FromBody] AddItemToBasketRequest request)
    {
        var command = new AddItemToBasketCommand(userName, request.ProductId, request.Quantity, request.Color);

        var result = await sender.Send(command);

        return Ok(result);
    }
}