using Discount.Grpc.Features.Discounts.Commands.ActivateDiscount;
using Discount.Grpc.Features.Discounts.Commands.CreateCoupon;
using Discount.Grpc.Features.Discounts.Queries.GetDiscountsByProduct;
using Discount.Grpc.Features.Discounts.Queries.ValidateDiscount;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Discount.Grpc.Controllers;

/// <summary>
/// Contrôleur REST pour la gestion des réductions.
/// Fournit des endpoints HTTP pour activer, valider et récupérer les codes de réduction.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class DiscountsController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Crée un nouveau coupon de réduction (réservé aux administrateurs backoffice).
    /// </summary>
    /// <param name="request">Les informations du coupon à créer.</param>
    /// <returns>Le résultat de la création avec les détails du coupon.</returns>
    /// <response code="200">Le coupon a été créé avec succès.</response>
    /// <response code="400">Les données du coupon sont invalides ou le code existe déjà.</response>
    [HttpPost]
    [ProducesResponseType(typeof(CreateCouponCommandResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(BadRequestObjectResult), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CreateCouponCommandResult>> CreateCoupon(
        [FromBody] CreateCouponCommand request)
    {
        var result = await sender.Send(request);
        return Ok(result);
    }

    /// <summary>
    /// Active un coupon de réduction (réservé aux administrateurs backoffice).
    /// Change le statut du coupon à "Active" pour le rendre utilisable par les clients.
    /// </summary>
    /// <param name="request">Le code du coupon à activer.</param>
    /// <returns>Le résultat de l'activation avec les détails du coupon.</returns>
    /// <response code="200">Le coupon a été activé avec succès.</response>
    /// <response code="400">Le coupon ne peut pas être activé (dates invalides, déjà actif, etc.).</response>
    /// <response code="404">Le code de réduction n'existe pas.</response>
    [HttpPost("activate")]
    [ProducesResponseType(typeof(ActivateDiscountCommandResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(BadRequestObjectResult), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(NotFoundObjectResult), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ActivateDiscountCommandResult>> ActivateDiscount(
        [FromBody] ActivateDiscountCommand request)
    {
        var result = await sender.Send(request);
        return Ok(result);
    }

    /// <summary>
    /// Valide un code de réduction sans l'appliquer.
    /// </summary>
    /// <param name="code">Le code de réduction à valider.</param>
    /// <returns>Le résultat de la validation avec les détails du coupon si valide.</returns>
    /// <response code="200">La validation a été effectuée (peut être valide ou invalide).</response>
    [HttpGet("validate/{code}")]
    [ProducesResponseType(typeof(ValidateDiscountQueryResult), StatusCodes.Status200OK)]
    public async Task<ActionResult<ValidateDiscountQueryResult>> ValidateDiscount(string code)
    {
        var result = await sender.Send(new ValidateDiscountQuery(code));
        return Ok(result);
    }

    /// <summary>
    /// Récupère toutes les réductions applicables à un produit donné.
    /// </summary>
    /// <param name="productId">L'identifiant du produit.</param>
    /// <returns>La liste des coupons actifs et valides pour le produit.</returns>
    /// <response code="200">La liste des réductions a été récupérée avec succès.</response>
    [HttpGet("product/{productId}")]
    [ProducesResponseType(typeof(GetDiscountsByProductQueryResult), StatusCodes.Status200OK)]
    public async Task<ActionResult<GetDiscountsByProductQueryResult>> GetDiscountsByProduct(string productId)
    {
        var result = await sender.Send(new GetDiscountsByProductQuery(productId));
        return Ok(result);
    }
}
