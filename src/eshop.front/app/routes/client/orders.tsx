import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { orderingApiService } from "~/lib/api/services/ordering-api.service";
import { useMockUserId } from "~/contexts/mock-user-context";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import { ApiError } from "~/lib/api/apiClient";
import type { OrderDto } from "~/lib/api/services";

/** Convertit userId mock en Guid pour Ordering API */
function userIdToCustomerId(userId: string): string {
	const hash = userId
		.split("")
		.reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 0);
	const hex = hash.toString(16).padStart(8, "0");
	return `00000000-0000-0000-0000-${hex.padStart(12, "0")}`;
}

const statusLabels: Record<string, string> = {
	Draft: "Brouillon",
	Pending: "En attente",
	Submitted: "Soumis",
	Cancelled: "Annulé",
	Confirmed: "Confirmé",
	Completed: "Terminé",
	Shipped: "Expédié",
	Delivered: "Livré",
};

export default function Orders() {
	const userId = useMockUserId();
	const location = useLocation();
	const [orders, setOrders] = useState<OrderDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const successMessage = (location.state as { message?: string })?.message;

	useEffect(() => {
		async function fetchOrders() {
			if (!userId) {
				setLoading(false);
				return;
			}
			try {
				setError(null);
				const customerId = userIdToCustomerId(userId);
				const res = await orderingApiService.getOrdersByCustomerId(customerId);
				setOrders(res.data ?? []);
			} catch (err) {
				setError(
					err instanceof ApiError
						? err.message
						: "Impossible de charger les commandes",
				);
			} finally {
				setLoading(false);
			}
		}
		fetchOrders();
	}, [userId]);

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[40vh]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-4xl font-bold mb-8">Mes commandes</h1>

			{successMessage && (
				<div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
					{successMessage}
				</div>
			)}

			{error && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
					{error}
					<p className="text-sm mt-2">
						Assurez-vous que le gateway et Ordering.API sont démarrés.
					</p>
				</div>
			)}

			{orders.length === 0 && !error ? (
				<Card>
					<CardHeader>
						<CardTitle>Aucune commande</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							Vous n'avez pas encore passé de commande.
						</p>
						<Button asChild>
							<Link to="/">Découvrir nos produits</Link>
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{orders.map((order) => (
						<Card key={order.id}>
							<CardHeader className="flex flex-row items-center justify-between">
								<CardTitle>{order.orderName}</CardTitle>
								<span className="text-sm font-medium text-muted-foreground">
									{statusLabels[order.orderStatus] ?? order.orderStatus}
								</span>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{order.orderItems.map((item) => (
										<div
											key={`${item.orderId}-${item.productId}`}
											className="flex justify-between text-sm"
										>
											<span>
												Produit {item.productId} × {item.quantity}
											</span>
											<span>{(item.price * item.quantity).toFixed(2)} €</span>
										</div>
									))}
								</div>
								<div className="mt-4 pt-4 border-t flex justify-between font-semibold">
									<span>Total</span>
									<span>
										{order.orderItems
											.reduce((s, i) => s + i.price * i.quantity, 0)
											.toFixed(2)}{" "}
										€
									</span>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
