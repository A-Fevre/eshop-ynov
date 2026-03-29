import type { Route } from "./+types/product.$id";
import { catalogApiService } from "~/lib/api/services/catalog-api.service";
import { discountApiService } from "~/lib/api/services/discount-api.service";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
	Shield,
	Truck,
	RefreshCw,
	Star,
	Check,
	Plus,
	Minus,
	ArrowRight,
	Cpu,
	Battery,
	Wifi,
	HardDrive,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { useBasket } from "~/hooks/useBasket";
import { useMockUserId } from "~/contexts/mock-user-context";

/**
 * Loader pour charger un produit et ses réductions (Discount API)
 */
export async function loader({ params }: Route.LoaderArgs) {
	try {
		const [productRes, discountRes] = await Promise.all([
			catalogApiService.getProductById(params.id),
			discountApiService
				.getDiscountsByProduct(params.id)
				.catch(() => ({ data: { coupons: [] } })),
		]);
		const product = productRes.data;
		const coupons = discountRes.data?.coupons ?? [];
		return { product, coupons };
	} catch (error) {
		console.error("Error loading product:", error);
		throw new Response("Produit non trouvé", { status: 404 });
	}
}

/**
 * Page de détail d'un produit tech
 * Design épuré avec focus sur le produit et CTA clairs
 */
export default function ProductDetail({ loaderData }: Route.ComponentProps) {
	const { product, coupons } = loaderData;
	const [quantity, setQuantity] = useState(1);
	const navigate = useNavigate();

	const userId = useMockUserId();
	const { addItem, loading: basketLoading } = useBasket(userId);
	const [isAddingToCart, setIsAddingToCart] = useState(false);

	const getValidImageUrl = (imageFile: string | null): string => {
		if (!imageFile) {
			return "/placeholder-product.svg";
		}
		return `${import.meta.env.VITE_PICTURES_BASE_URL}/${imageFile}`;
	};

	const handleAddToCart = async () => {
		try {
			setIsAddingToCart(true);
			await addItem(product.id, quantity);
			alert(`${quantity}x ${product.name} ajouté(s) au panier !`);
		} catch (error) {
			console.error("Failed to add to cart:", error);
			alert("Échec de l'ajout au panier. Veuillez réessayer.");
		} finally {
			setIsAddingToCart(false);
		}
	};

	const handleBuyNow = async () => {
		try {
			setIsAddingToCart(true);
			await addItem(product.id, quantity);
			// Rediriger directement vers le panier
			navigate("/cart");
		} catch (error) {
			console.error("Failed to add to cart:", error);
			alert("Échec de l'ajout au panier. Veuillez réessayer.");
			setIsAddingToCart(false);
		}
	};

	const incrementQuantity = () => setQuantity((prev) => prev + 1);
	const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

	return (
		<div className="w-full bg-white dark:bg-slate-950">
			{/* Breadcrumb */}
			<div className="border-b bg-slate-50 dark:bg-slate-900/50">
				<div className="container mx-auto px-4 py-4">
					<nav className="flex items-center gap-2 text-sm text-muted-foreground">
						<Link to="/" className="hover:text-foreground transition-colors">
							Accueil
						</Link>
						<span>/</span>
						<Link
							to="/products"
							className="hover:text-foreground transition-colors"
						>
							Produits
						</Link>
						<span>/</span>
						<span className="text-foreground font-medium">{product.name}</span>
					</nav>
				</div>
			</div>

			{/* Product Detail Section */}
			<section className="py-12 lg:py-20">
				<div className="container mx-auto px-4">
					<div className="grid lg:grid-cols-2 gap-12 lg:gap-20 max-w-7xl mx-auto">
						{/* Left - Product Image */}
						<div className="lg:sticky lg:top-24 lg:self-start">
							<div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden shadow-xl">
								<div className="w-full h-full flex items-center justify-center">
									{product.imageFile ? (
										<img
											src={getValidImageUrl(product.imageFile ?? null)}
											alt={product.name}
											className="w-full h-full object-cover"
											onError={(e) => {
												e.currentTarget.style.display = "none";
												e.currentTarget.parentElement?.classList.add(
													"flex",
													"flex-col",
													"items-center",
													"text-primary/30",
												);
												const fallback = document.createElement("div");
												const categoryName = product.categories[0] || "Produit";
												fallback.innerHTML = `<svg class="h-32 w-32 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg><span class="text-2xl font-bold">${categoryName}</span>`;
												e.currentTarget.parentElement?.appendChild(fallback);
											}}
										/>
									) : (
										<div className="flex flex-col items-center text-primary/30">
											<Cpu className="h-32 w-32 mb-4" />
											<span className="text-2xl font-bold">
												{product.categories[0] || "Produit"}
											</span>
										</div>
									)}
								</div>
							</div>

							{/* Trust Badges (Desktop) */}
							<div className="hidden lg:grid grid-cols-3 gap-4 mt-8">
								<div className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
									<Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
									<p className="text-xs font-medium">Paiement sécurisé</p>
								</div>
								<div className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
									<Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
									<p className="text-xs font-medium">Livraison gratuite</p>
								</div>
								<div className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
									<RefreshCw className="h-6 w-6 mx-auto mb-2 text-primary" />
									<p className="text-xs font-medium">Retours faciles</p>
								</div>
							</div>
						</div>

						{/* Right - Product Info */}
						<div className="space-y-8">
							{/* Title & Rating */}
							<div>
								<div className="flex items-center gap-2 mb-3">
									{product.categories.map((category: string) => (
										<span
											key={category}
											className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary"
										>
											{category}
										</span>
									))}
								</div>

								<h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
									{product.name}
								</h1>

								<div className="flex items-center gap-2 mb-4">
									<div className="flex gap-1">
										{[1, 2, 3, 4, 5].map((star) => (
											<Star
												key={star}
												className="h-5 w-5 fill-primary text-primary"
											/>
										))}
									</div>
									<span className="text-sm text-muted-foreground">
										(4.8) 256 avis
									</span>
								</div>

								<div className="flex items-baseline gap-3 flex-wrap">
									<span className="text-5xl font-bold">
										{product.price.toFixed(2)} €
									</span>
									{coupons && coupons.length > 0 && coupons[0] && (
										<span className="px-2 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 text-sm font-semibold rounded-full">
											{coupons[0].type === "Percentage"
												? `-${coupons[0].value}%`
												: `-${coupons[0].value} €`}
											{coupons[0].code && ` (${coupons[0].code})`}
										</span>
									)}
								</div>
							</div>

							{/* Description */}
							<div className="prose dark:prose-invert max-w-none">
								<h2 className="text-xl font-semibold mb-3">
									Description du produit
								</h2>
								<p className="text-muted-foreground leading-relaxed text-lg">
									{product.description}
								</p>
							</div>

							{/* Key Features - Tech specific */}
							<div>
								<h3 className="text-lg font-semibold mb-4">
									Caractéristiques principales
								</h3>
								<div className="space-y-3">
									{[
										{
											id: "quality",
											icon: Cpu,
											text: "Processeur haute performance",
										},
										{
											id: "battery",
											icon: Battery,
											text: "Batterie longue durée",
										},
										{
											id: "connectivity",
											icon: Wifi,
											text: "Connectivité avancée",
										},
										{
											id: "storage",
											icon: HardDrive,
											text: "Stockage optimisé",
										},
									].map((feature) => {
										const Icon = feature.icon;
										return (
											<div key={feature.id} className="flex items-start gap-3">
												<div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
													<Icon className="h-4 w-4 text-primary" />
												</div>
												<span className="text-muted-foreground">
													{feature.text}
												</span>
											</div>
										);
									})}
								</div>
							</div>

							{/* Quantity Selector */}
							<div>
								<label
									htmlFor="quantity-input"
									className="text-sm font-semibold mb-3 block"
								>
									Quantité
								</label>
								<div className="flex items-center gap-4">
									<div className="flex items-center border rounded-full overflow-hidden">
										<Button
											variant="ghost"
											size="icon"
											onClick={decrementQuantity}
											className="rounded-none h-12 w-12"
											disabled={quantity <= 1}
											aria-label="Diminuer la quantité"
										>
											<Minus className="h-4 w-4" />
										</Button>
										<input
											id="quantity-input"
											type="number"
											value={quantity}
											readOnly
											className="w-16 text-center font-semibold bg-transparent border-none outline-none"
											aria-label="Quantité produit"
										/>
										<Button
											variant="ghost"
											size="icon"
											onClick={incrementQuantity}
											className="rounded-none h-12 w-12"
											aria-label="Augmenter la quantité"
										>
											<Plus className="h-4 w-4" />
										</Button>
									</div>
									<span className="text-sm text-muted-foreground">
										Total :{" "}
										<span className="font-bold text-foreground">
											{(product.price * quantity).toFixed(2)} €
										</span>
									</span>
								</div>
							</div>

							{/* Add to Cart */}
							<div className="space-y-3 pt-4">
								<Button
									size="lg"
									className="w-full rounded-full text-base h-14"
									onClick={handleAddToCart}
									disabled={isAddingToCart}
								>
									{isAddingToCart ? "Ajout en cours..." : "Ajouter au panier"}
									<ArrowRight className="ml-2 h-5 w-5" />
								</Button>
								<Button
									size="lg"
									variant="outline"
									className="w-full rounded-full text-base h-14"
									onClick={handleBuyNow}
									disabled={isAddingToCart}
								>
									{isAddingToCart ? "Ajout en cours..." : "Acheter maintenant"}
								</Button>
							</div>

							{/* Trust Badges (Mobile) */}
							<div className="grid grid-cols-3 gap-4 lg:hidden pt-8 border-t">
								<div className="text-center">
									<Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
									<p className="text-xs font-medium">Sécurisé</p>
								</div>
								<div className="text-center">
									<Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
									<p className="text-xs font-medium">Livraison</p>
								</div>
								<div className="text-center">
									<RefreshCw className="h-6 w-6 mx-auto mb-2 text-primary" />
									<p className="text-xs font-medium">Retours</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Additional Info Section */}
			<section className="py-16 bg-slate-50 dark:bg-slate-900">
				<div className="container mx-auto px-4">
					<div className="max-w-5xl mx-auto">
						<h2 className="text-3xl font-bold text-center mb-12">
							Détails du produit
						</h2>

						<div className="grid md:grid-cols-3 gap-8">
							<Card>
								<CardContent className="p-6">
									<Shield className="h-10 w-10 text-primary mb-4" />
									<h3 className="font-semibold text-lg mb-2">Garantie 2 ans</h3>
									<p className="text-sm text-muted-foreground leading-relaxed">
										Tous nos produits sont garantis 2 ans. Service après-vente
										rapide et efficace.
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-6">
									<Truck className="h-10 w-10 text-primary mb-4" />
									<h3 className="font-semibold text-lg mb-2">
										Livraison rapide
									</h3>
									<p className="text-sm text-muted-foreground leading-relaxed">
										Livraison gratuite dès 50€ d'achat. Livraison express
										disponible en 24-48h.
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-6">
									<RefreshCw className="h-10 w-10 text-primary mb-4" />
									<h3 className="font-semibold text-lg mb-2">
										Retours 30 jours
									</h3>
									<p className="text-sm text-muted-foreground leading-relaxed">
										Pas satisfait ? Retournez le produit sous 30 jours pour un
										remboursement complet.
									</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-16 bg-primary">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
						Des questions sur ce produit ?
					</h2>
					<p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
						Notre équipe de support est là pour vous aider
					</p>
					<Button size="lg" variant="secondary" className="rounded-full px-8">
						Contacter le support
					</Button>
				</div>
			</section>
		</div>
	);
}
