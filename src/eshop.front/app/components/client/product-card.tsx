import { Link } from "react-router";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import type { Product } from "~/lib/api/services/catalog-api.service";

interface ProductCardProps {
	product: Product;
	onAddToCart?: (product: Product) => void;
}

/**
 * Helper pour obtenir une URL d'image valide
 * Si l'URL ne commence pas par / ou http, on ajoute /
 * Si aucune image, on retourne un placeholder
 */
function getValidImageUrl(imageFile: string | null | undefined): string {
	if (!imageFile) {
		return "/placeholder-product.svg";
	}
	return `${import.meta.env.VITE_PICTURES_BASE_URL}/${imageFile}`;
}

/**
 * Composant de carte produit pour le storefront
 * Affiche les informations d'un produit avec bouton d'ajout au panier
 */
export function ProductCard({ product, onAddToCart }: ProductCardProps) {
	const imageUrl = getValidImageUrl(product.imageFile);

	return (
		<Card className="overflow-hidden transition-all hover:shadow-lg">
			<Link to={`/products/${product.id}`}>
				<div className="aspect-square overflow-hidden bg-gray-100">
					<img
						src={imageUrl}
						alt={product.name}
						className="h-full w-full object-cover transition-transform hover:scale-105"
						onError={(e) => {
							// Si l'image ne charge pas, utiliser le placeholder
							e.currentTarget.src = "/placeholder-product.svg";
						}}
					/>
				</div>
			</Link>
			<CardHeader>
				<CardTitle className="line-clamp-2">
					<Link to={`/products/${product.id}`} className="hover:text-primary">
						{product.name}
					</Link>
				</CardTitle>
				<div className="flex flex-wrap gap-1">
					{product.categories.map((category) => (
						<span
							key={category}
							className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md"
						>
							{category}
						</span>
					))}
				</div>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground line-clamp-2">
					{product.description}
				</p>
			</CardContent>
			<CardFooter className="flex items-center justify-between">
				<span className="text-2xl font-bold">{product.price.toFixed(2)} €</span>
				<Button onClick={() => onAddToCart?.(product)} variant="default">
					Ajouter
				</Button>
			</CardFooter>
		</Card>
	);
}
