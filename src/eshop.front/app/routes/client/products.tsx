import type { Route } from "./+types/products";
import {
	catalogApiService,
	type Product,
} from "~/lib/api/services/catalog-api.service";
import { retry } from "~/lib/retry";
import { ProductCard } from "~/components/client/product-card";
import { Button } from "~/components/ui/button";
import { useBasket } from "~/hooks/useBasket";
import { useMockUserId } from "~/contexts/mock-user-context";
import { useState } from "react";
import {
	Form,
	useNavigation,
	useRevalidator,
	useSearchParams,
	useSubmit,
} from "react-router";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { ProductCardSkeleton } from "~/components/ui/skeleton";
import { Search, SlidersHorizontal } from "lucide-react";

/**
 * Loader pour charger les produits avec filtres et pagination
 */
export async function loader({ request }: Route.LoaderArgs) {
	try {
		const url = new URL(request.url);
		const page = Number.parseInt(url.searchParams.get("page") || "0");
		const pageSize = Number.parseInt(url.searchParams.get("pageSize") || "12");
		const search = url.searchParams.get("search") || "";
		const category = url.searchParams.get("category") || "";
		const sortBy = url.searchParams.get("sortBy") || "name";
		const sortOrder = url.searchParams.get("sortOrder") || "asc";

    const response = await retry(
      () => catalogApiService.getProducts(page, pageSize),
      { retries: 5, delayMs: 1000 }
    );

    // Client-side filtering (in production, this should be done server-side)
    let filteredProducts = response.data.data;

		if (search) {
			filteredProducts = filteredProducts.filter(
				(p: Product) =>
					p.name.toLowerCase().includes(search.toLowerCase()) ||
					p.description.toLowerCase().includes(search.toLowerCase()),
			);
		}

		if (category) {
			filteredProducts = filteredProducts.filter((p: Product) =>
				p.categories.includes(category),
			);
		}

		// Sorting
		filteredProducts.sort((a: Product, b: Product) => {
			const sortKey = sortBy as keyof Product;
			let aValue = a[sortKey];
			let bValue = b[sortKey];

			if (sortBy === "price") {
				aValue = Number(aValue);
				bValue = Number(bValue);
			}

			if (sortOrder === "asc") {
				return aValue > bValue ? 1 : -1;
			}
			return aValue < bValue ? 1 : -1;
		});

		// Get all unique categories
		const allCategories = new Set<string>();
		for (const product of response.data.data) {
			for (const cat of product.categories) {
				allCategories.add(cat);
			}
		}

		return {
			products: filteredProducts,
			totalCount: filteredProducts.length,
			categories: Array.from(allCategories).sort(),
			filters: {
				page,
				pageSize,
				search,
				category,
				sortBy,
				sortOrder,
			},
		};
	} catch (error) {
		console.error("Error loading products:", error);
		return {
			products: [],
			totalCount: 0,
			categories: [],
			filters: {
				page: 0,
				pageSize: 12,
				search: "",
				category: "",
				sortBy: "name",
				sortOrder: "asc",
			},
		};
	}
}

/**
 * Page catalogue produits avec filtres et tri
 */
const PRODUCTS_SKELETON_KEYS = Array.from(
	{ length: 12 },
	(_, i) => `products-skeleton-${i}` as const,
);

export default function ProductsPage({ loaderData }: Route.ComponentProps) {
	const { products, totalCount, categories, filters } = loaderData;
	const [searchParams] = useSearchParams();
	const submit = useSubmit();
	const navigation = useNavigation();
	const revalidator = useRevalidator();
	const [showFilters, setShowFilters] = useState(false);

	const userId = useMockUserId();
	const { addItem } = useBasket(userId);
	const [addingProductId, setAddingProductId] = useState<string | null>(null);

	const isLoading =
		navigation.state === "loading" || revalidator.state === "loading";

	const handleAddToCart = async (product: Product) => {
		try {
			setAddingProductId(product.id);
			await addItem(product.id, 1);
			alert(`${product.name} ajouté au panier !`);
		} catch (error) {
			console.error("Failed to add to cart:", error);
			alert("Échec de l'ajout au panier. Veuillez réessayer.");
		} finally {
			setAddingProductId(null);
		}
	};

	const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		submit(formData);
	};

	if (isLoading) {
		return (
			<div className="w-full bg-white dark:bg-slate-950">
				<section className="border-b bg-slate-50 dark:bg-slate-900/50">
					<div className="container mx-auto px-4 py-8">
						<div className="h-10 w-64 rounded-md bg-muted animate-pulse mb-2" />
						<div className="h-6 w-96 rounded-md bg-muted animate-pulse" />
					</div>
				</section>
				<section className="border-b bg-white dark:bg-slate-950 py-4">
					<div className="container mx-auto px-4">
						<div className="flex flex-col lg:flex-row gap-4">
							<div className="h-10 flex-1 rounded-md bg-muted animate-pulse" />
							<div className="h-10 w-48 rounded-md bg-muted animate-pulse" />
							<div className="h-10 w-48 rounded-md bg-muted animate-pulse" />
						</div>
					</div>
				</section>
				<section className="py-12">
					<div className="container mx-auto px-4">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{PRODUCTS_SKELETON_KEYS.map((key) => (
								<ProductCardSkeleton key={key} />
							))}
						</div>
					</div>
				</section>
			</div>
		);
	}

	return (
		<div className="w-full bg-white dark:bg-slate-950">
			{/* Header */}
			<section className="border-b bg-slate-50 dark:bg-slate-900/50">
				<div className="container mx-auto px-4 py-8">
					<h1 className="text-4xl lg:text-5xl font-bold mb-2">Nos Produits</h1>
					<p className="text-muted-foreground text-lg">
						Découvrez notre catalogue de {totalCount} produits tech
					</p>
				</div>
			</section>

			{/* Filters & Search */}
			<section className="border-b bg-white dark:bg-slate-950 sticky top-0 z-10 shadow-sm">
				<div className="container mx-auto px-4 py-4">
					<div className="flex flex-col lg:flex-row gap-4">
						{/* Search */}
						<Form method="get" onSubmit={handleSearchSubmit} className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									type="search"
									name="search"
									placeholder="Rechercher un produit..."
									defaultValue={filters.search}
									className="pl-10"
								/>
							</div>
						</Form>

						{/* Category Filter */}
						<Form method="get" className="w-full lg:w-48">
							<Select
								name="category"
								value={filters.category || "all"}
								onValueChange={(value) => {
									const form = new FormData();
									form.set("category", value === "all" ? "" : value);
									form.set("search", filters.search);
									form.set("sortBy", filters.sortBy);
									form.set("sortOrder", filters.sortOrder);
									submit(form);
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Toutes les catégories" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Toutes les catégories</SelectItem>
									{categories.map((cat: string) => (
										<SelectItem key={cat} value={cat}>
											{cat}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Form>

						{/* Sort */}
						<Form method="get" className="w-full lg:w-48">
							<Select
								name="sortBy"
								defaultValue={`${filters.sortBy}-${filters.sortOrder}`}
								onValueChange={(value) => {
									const [sortBy, sortOrder] = value.split("-");
									const form = new FormData();
									form.set("sortBy", sortBy);
									form.set("sortOrder", sortOrder);
									form.set("category", filters.category);
									form.set("search", filters.search);
									submit(form);
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Trier par" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="name-asc">Nom (A-Z)</SelectItem>
									<SelectItem value="name-desc">Nom (Z-A)</SelectItem>
									<SelectItem value="price-asc">Prix (croissant)</SelectItem>
									<SelectItem value="price-desc">Prix (décroissant)</SelectItem>
								</SelectContent>
							</Select>
						</Form>

						{/* Mobile Filter Toggle */}
						<Button
							variant="outline"
							className="lg:hidden"
							onClick={() => setShowFilters(!showFilters)}
						>
							<SlidersHorizontal className="h-4 w-4 mr-2" />
							Filtres
						</Button>
					</div>

					{/* Active Filters */}
					{(filters.search || filters.category) && (
						<div className="flex flex-wrap gap-2 mt-4">
							{filters.search && (
								<div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2">
									Recherche : "{filters.search}"
									<Form method="get" className="inline">
										<input
											type="hidden"
											name="category"
											value={filters.category}
										/>
										<input type="hidden" name="sortBy" value={filters.sortBy} />
										<input
											type="hidden"
											name="sortOrder"
											value={filters.sortOrder}
										/>
										<button type="submit" className="hover:text-primary/70">
											×
										</button>
									</Form>
								</div>
							)}
							{filters.category && (
								<div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2">
									Catégorie : {filters.category}
									<Form method="get" className="inline">
										<input type="hidden" name="search" value={filters.search} />
										<input type="hidden" name="sortBy" value={filters.sortBy} />
										<input
											type="hidden"
											name="sortOrder"
											value={filters.sortOrder}
										/>
										<button type="submit" className="hover:text-primary/70">
											×
										</button>
									</Form>
								</div>
							)}
						</div>
					)}
				</div>
			</section>

			{/* Products Grid */}
			<section className="py-12">
				<div className="container mx-auto px-4">
					{products.length === 0 ? (
						<div className="text-center py-16">
							<p className="text-2xl font-semibold mb-2">
								Aucun produit trouvé
							</p>
							<p className="text-muted-foreground mb-6">
								Essayez de modifier vos filtres ou réessayez le chargement.
							</p>
							<div className="flex flex-wrap justify-center gap-3">
								<Form method="get">
									<Button type="submit" variant="outline">
										Effacer les filtres
									</Button>
								</Form>
								<Button
									variant="outline"
									onClick={() => revalidator.revalidate()}
									disabled={revalidator.state === "loading"}
								>
									{revalidator.state === "loading"
										? "Chargement…"
										: "Réessayer"}
								</Button>
							</div>
						</div>
					) : (
						<>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
								{products.map((product: Product) => (
									<ProductCard
										key={product.id}
										product={product}
										onAddToCart={handleAddToCart}
									/>
								))}
							</div>

							{/* Pagination */}
							<div className="mt-12 flex justify-center gap-2">
								<Form method="get">
									<input
										type="hidden"
										name="page"
										value={Math.max(0, filters.page - 1)}
									/>
									<input type="hidden" name="search" value={filters.search} />
									<input
										type="hidden"
										name="category"
										value={filters.category}
									/>
									<input type="hidden" name="sortBy" value={filters.sortBy} />
									<input
										type="hidden"
										name="sortOrder"
										value={filters.sortOrder}
									/>
									<Button
										type="submit"
										variant="outline"
										disabled={filters.page === 0}
									>
										Précédent
									</Button>
								</Form>

								<span className="px-4 py-2 flex items-center">
									Page {filters.page + 1}
								</span>

								<Form method="get">
									<input type="hidden" name="page" value={filters.page + 1} />
									<input type="hidden" name="search" value={filters.search} />
									<input
										type="hidden"
										name="category"
										value={filters.category}
									/>
									<input type="hidden" name="sortBy" value={filters.sortBy} />
									<input
										type="hidden"
										name="sortOrder"
										value={filters.sortOrder}
									/>
									<Button
										type="submit"
										variant="outline"
										disabled={products.length < filters.pageSize}
									>
										Suivant
									</Button>
								</Form>
							</div>
						</>
					)}
				</div>
			</section>
		</div>
	);
}
