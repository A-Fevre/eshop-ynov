import { useState } from "react";
import type { Route } from "./+types/checkout";
import { Link, useNavigate } from "react-router";
import { basketApiService } from "~/lib/api/services/basket-api.service";
import { useBasket } from "~/hooks/useBasket";
import { useMockUserId } from "~/contexts/mock-user-context";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import { ApiError } from "~/lib/api/apiClient";
import type { BasketCheckoutDto } from "~/lib/api/services";

/** Génère un Guid stable à partir du userId (mock) */
function userIdToCustomerId(userId: string): string {
	const hash = userId
		.split("")
		.reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 0);
	const hex = hash.toString(16).padStart(8, "0");
	return `00000000-0000-0000-0000-${hex.padStart(12, "0")}`;
}

/** Valeurs mock pour BasketCheckoutDto - requis par l'API mais non affichés */
function buildMockCheckoutDto(
	userId: string,
	totalPrice: number,
): BasketCheckoutDto {
	return {
		CustomerId: userIdToCustomerId(userId),
		TotalPrice: totalPrice,
		FirstName: "Client",
		LastName: userId,
		EmailAddress: `${userId}@mock.local`,
		AddressLine: "Adresse mock",
		Country: "FR",
		State: "",
		ZipCode: "75001",
		CardName: "MOCK",
		CardNumber: "0000-0000-0000-0000",
		Expiration: "12/99",
		Cvv: "000",
		PaymentMethod: 1,
	};
}

export default function Checkout() {
	const userId = useMockUserId();
	const { basket, loading: basketLoading } = useBasket(userId);
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!userId || !basket || basket.items.length === 0) return;

		setIsSubmitting(true);
		setError(null);
		try {
			const dto = buildMockCheckoutDto(userId, basket.totalPrice);
			const res = await basketApiService.checkout(userId, dto);
			if (res.data.isSuccess) {
				navigate("/orders", { state: { message: res.data.message } });
			} else {
				setError(res.data.message || "Checkout échoué");
			}
		} catch (err) {
			setError(
				err instanceof ApiError ? err.message : "Erreur lors du checkout",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (basketLoading || !basket) {
		return (
			<div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[40vh]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (basket.items.length === 0) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Card>
					<CardHeader>
						<CardTitle>Panier vide</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							Votre panier est vide. Ajoutez des articles avant de passer
							commande.
						</p>
						<Button asChild>
							<Link to="/">Continuer les achats</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-4xl font-bold mb-8">Checkout</h1>

			<form onSubmit={handleSubmit} className="max-w-md">
				<Card>
					<CardHeader>
						<CardTitle>Récapitulatif</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{basket.items.map((item) => (
								<div
									key={item.productId}
									className="flex justify-between text-sm"
								>
									<span>
										{item.productName} × {item.quantity}
									</span>
									<span>
										{(
											(item.discountPrice ?? item.price) * item.quantity
										).toFixed(2)}{" "}
										€
									</span>
								</div>
						))}
						<div className="border-t pt-4 flex justify-between text-lg font-bold">
								<span>Total</span>
								<span>{basket.totalPrice.toFixed(2)} €</span>
						</div>
						{error && <p className="text-sm text-red-500">{error}</p>}
						<Button
								type="submit"
								size="lg"
								className="w-full"
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
										Traitement...
									</>
								) : (
									"Confirmer la commande"
								)}
							</Button>
						<Button variant="outline" asChild className="w-full">
								<Link to="/cart">Retour au panier</Link>
						</Button>
					</CardContent>
					</Card>
			</form>
		</div>
	);
}
