import { useLoaderData } from "react-router";
import type { Route } from "./+types/products";
import {
	catalogApiService,
	type Product,
} from "~/lib/api/services/catalog-api.service";
import { Button } from "~/components/ui/button";
import { ProductTable } from "~/components/admin/product-table";

/**
 * Loader pour charger les produits
 */
export async function loader({ request }: Route.LoaderArgs) {
	try {
		const url = new URL(request.url);
		const page = Number.parseInt(url.searchParams.get("page") || "0");
		const pageSize = Number.parseInt(url.searchParams.get("pageSize") || "20");

		const response = await catalogApiService.getProducts(page, pageSize);

		return {
			products: response.data.data,
			pagination: {
				pageIndex: response.data.pageIndex,
				pageSize: response.data.pageSize,
				totalCount: response.data.count ?? response.data.totalCount ?? 0,
			},
		};
	} catch (error) {
		console.error("Error loading products:", error);
		return {
			products: [],
			pagination: { pageIndex: 0, pageSize: 20, totalCount: 0 },
			error: "Échec du chargement des produits",
		};
	}
}

/**
 * Page de gestion des produits
 * Permet de créer, éditer et supprimer des produits
 */
export default function AdminProducts({ loaderData }: Route.ComponentProps) {
	const { products, pagination, error } = loaderData;

	const handleEdit = (product: Product) => {
		// TODO: Implement edit logic (open modal or navigate to edit page)
		alert(`Modifier le produit : ${product.name}`);
	};

	const handleDelete = async (productId: string) => {
		if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
			return;
		}

		try {
			await catalogApiService.deleteProduct(productId);
			alert("Produit supprimé avec succès");
			// TODO: Refresh the page or update the list
			window.location.reload();
		} catch (error) {
			console.error("Error deleting product:", error);
			alert("Échec de la suppression du produit");
		}
	};

	const handleCreateNew = () => {
		// TODO: Implement create logic (open modal or navigate to create page)
		console.log("Créer un nouveau produit");
		alert("Créer un nouveau produit - à implémenter");
	};

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
					{error}
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-4xl font-bold mb-2">Gestion des produits</h1>
					<p className="text-muted-foreground">
						Gérez votre catalogue de produits ({pagination.totalCount} produits)
					</p>
				</div>
				<Button size="lg" onClick={handleCreateNew}>
					Nouveau produit
				</Button>
			</div>

			{/* Products Table */}
			<ProductTable
				products={products}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>

			{/* Pagination Info */}
			{products.length > 0 && (
				<div className="mt-6 text-center text-sm text-muted-foreground">
					Affichage de {products.length} sur {pagination.totalCount} produits
				</div>
			)}
		</div>
	);
}
