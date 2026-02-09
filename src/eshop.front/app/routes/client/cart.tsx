import { Link } from "react-router";
import type { Route } from "./+types/cart";
import { basketApiService } from "~/lib/api/services/basket-api.service";
import { useBasket } from "~/hooks/useBasket";
import { useMockUserId } from "~/contexts/mock-user-context";
import { getMockUserIdFromCookieHeader } from "~/lib/mock-user";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { retry } from "~/lib/retry";

/**
 * Loader pour charger le panier côté serveur (SSR)
 * Lit l'utilisateur mock depuis le cookie de la requête.
 */
export async function loader({ request }: Route.LoaderArgs) {
	try {
		const cookieHeader = request.headers.get("Cookie");
		const userId = getMockUserIdFromCookieHeader(cookieHeader);
		if (!userId) {
			return { initialBasket: null };
		}
		const response = await retry(() => basketApiService.getBasket(userId), {
			retries: 5,
			delayMs: 1000,
		});
		return { initialBasket: response.data };
	} catch {
		return { initialBasket: null };
	}
}

/**
 * Page du panier d'achat
 * Affiche les articles dans le panier avec possibilité de modifier les quantités
 */
export default function Cart({ loaderData }: Route.ComponentProps) {
	const userId = useMockUserId();
	const {
		basket,
		loading,
		error: hookError,
		updateItemQuantity,
		removeItem,
	} = useBasket(userId);

	const error = hookError;

	const handleUpdateQuantity = async (
		productId: string,
		newQuantity: number,
	) => {
		try {
			await updateItemQuantity(productId, newQuantity);
		} catch (e) {
			console.error(e);
		}
	};

	const handleRemoveItem = async (productId: string) => {
		try {
			await removeItem(productId);
		} catch (e) {
			console.error(e);
		}
	};

	if (error && !basket) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
					{error}
				</div>
			</div>
		);
	}

	// Show loading state if we have no data yet
	if (loading && !basket) {
		return (
			<div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!basket || basket.items.length === 0) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl">Votre panier est vide</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							Ajoutez des produits à votre panier pour commencer vos achats
						</p>
						<Button asChild>
							<a href="/">Continuer les achats</a>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Sous-total sans réduction (prix unitaire × quantité)
	const subtotal = basket.items.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);
	// Réductions venant du Discount API/DB (totalSavings ou différence subtotal - totalPrice)
	const discount =
		basket.totalSavings != null && basket.totalSavings > 0
			? Number(basket.totalSavings)
			: Math.max(0, subtotal - basket.totalPrice);
	const hasDiscount = discount > 0.01;

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-4xl font-bold mb-8">Mon Panier</h1>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Cart Items */}
				<div className="lg:col-span-2 space-y-4">
					{basket.items.map((item) => (
						<Card key={item.productId}>
							<CardContent className="p-4">
								<div className="flex gap-4">
									{/* Product Image */}
									<div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
										<img
											src={
												item.imageFile?.startsWith("http") ||
												item.imageFile?.startsWith("/")
													? item.imageFile
													: `/${item.imageFile}`
											}
											alt={item.productName}
											className="w-full h-full object-cover"
											onError={(e) => {
												e.currentTarget.src = "/placeholder-product.svg";
											}}
										/>
									</div>

									{/* Product Info */}
									<div className="flex-1">
										<h3 className="font-semibold text-lg mb-1">
											{item.productName}
										</h3>
										<p className="text-muted-foreground mb-2">
											{item.price.toFixed(2)} € l'unité
										</p>

										<div className="flex items-center gap-4">
											{/* Quantity Controls */}
											<div className="flex items-center gap-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														handleUpdateQuantity(
															item.productId,
															item.quantity - 1,
														)
													}
													disabled={item.quantity <= 1 || loading}
												>
													-
												</Button>
												<span className="w-12 text-center">
													{item.quantity}
												</span>
												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														handleUpdateQuantity(
															item.productId,
															item.quantity + 1,
														)
													}
													disabled={loading}
												>
													+
												</Button>
											</div>

											{/* Item Total */}
											<div className="ml-auto">
												<p className="font-semibold text-lg">
													{(item.price * item.quantity).toFixed(2)} €
												</p>
											</div>
										</div>
									</div>

									{/* Remove Button */}
									<Button
										size="sm"
										variant="ghost"
										className="text-destructive hover:text-destructive/90"
										onClick={() => handleRemoveItem(item.productId)}
										disabled={loading}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Order Summary */}
				<div className="lg:col-span-1">
					<Card>
						<CardHeader>
							<CardTitle>Récapitulatif de la commande</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Sous-total</span>
								<span className="font-semibold">{subtotal.toFixed(2)} €</span>
							</div>

							{hasDiscount && (
								<div className="flex justify-between text-green-600">
									<span>Remise (Discount API)</span>
									<span className="font-semibold">
										-{discount.toFixed(2)} €
									</span>
								</div>
							)}

							<div className="flex justify-between">
								<span className="text-muted-foreground">Livraison</span>
								<span className="font-semibold">Gratuite</span>
							</div>

							<div className="border-t pt-4 mt-4">
								<div className="flex justify-between">
									<span className="text-lg font-semibold">Total</span>
									<span className="text-2xl font-bold">
										{basket.totalPrice.toFixed(2)} €
									</span>
								</div>
							</div>
						</CardContent>
						<CardFooter>
							<Button size="lg" className="w-full" asChild>
								<Link to="/checkout">Procéder au paiement</Link>
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>
		</div>
	);
}
