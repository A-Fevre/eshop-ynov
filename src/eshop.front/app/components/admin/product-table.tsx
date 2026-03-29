import { Button } from "~/components/ui/button";
import type { Product } from "~/lib/api/services/catalog-api.service";

interface ProductTableProps {
	products: Product[];
	onEdit: (product: Product) => void;
	onDelete: (productId: string) => void;
}

/**
 * Composant de tableau de produits pour l'admin
 * Affiche les produits avec actions d'édition et suppression
 */
export function ProductTable({
	products,
	onEdit,
	onDelete,
}: ProductTableProps) {
	if (products.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				Aucun produit trouvé
			</div>
		);
	}

	return (
		<div className="border rounded-lg overflow-hidden">
			<table className="w-full">
				<thead className="bg-muted">
					<tr>
						<th className="text-left p-4 font-semibold">Image</th>
						<th className="text-left p-4 font-semibold">Nom</th>
						<th className="text-left p-4 font-semibold">Catégories</th>
						<th className="text-left p-4 font-semibold">Prix</th>
						<th className="text-left p-4 font-semibold">Actions</th>
					</tr>
				</thead>
				<tbody>
					{products.map((product) => (
						<tr key={product.id} className="border-t hover:bg-muted/50">
							<td className="p-4">
								<img
									src={product.imageFile?.startsWith("http") || product.imageFile?.startsWith("/") ? product.imageFile : `/${product.imageFile}` || "/placeholder-product.svg"}
									alt={product.name}
									className="w-16 h-16 object-cover rounded"
									onError={(e) => {
										e.currentTarget.src = "/placeholder-product.svg";
									}}
								/>
							</td>
							<td className="p-4">
								<div>
									<p className="font-semibold">{product.name}</p>
									<p className="text-sm text-muted-foreground line-clamp-1">
										{product.description}
									</p>
								</div>
							</td>
							<td className="p-4">
								<div className="flex flex-wrap gap-1">
									{product.categories.map((category) => (
										<span
											key={category}
											className="text-xs bg-secondary px-2 py-1 rounded"
										>
											{category}
										</span>
									))}
								</div>
							</td>
							<td className="p-4 font-semibold">{product.price.toFixed(2)} €</td>
							<td className="p-4">
								<div className="flex gap-2">
									<Button
										size="sm"
										variant="outline"
										onClick={() => onEdit(product)}
									>
										Modifier
									</Button>
									<Button
										size="sm"
										variant="destructive"
										onClick={() => onDelete(product.id)}
									>
										Supprimer
									</Button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
