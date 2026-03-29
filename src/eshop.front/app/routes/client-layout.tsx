import { Link, Outlet } from "react-router";
import {
	ShoppingCart,
	User,
	Menu,
	Search,
	Package,
	Settings,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { useBasket, useBasketItemCount } from "~/hooks/useBasket";
import { MockUserProvider, useMockUserId } from "~/contexts/mock-user-context";

function ClientLayoutContent() {
	const userId = useMockUserId();
	const { basket } = useBasket(userId);
	const itemCount = useBasketItemCount(basket);

	return (
		<div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans">
			{/* Top Bar (Promo/Announcement) */}
			<div className="bg-primary text-primary-foreground py-2 px-4 text-center text-xs font-medium tracking-wide flex items-center justify-center gap-4">
				<span>📦 Livraison gratuite dès 50€ | Retours sous 30 jours</span>
				<Link to="/admin" className="ml-auto">
					<Button
						variant="ghost"
						size="sm"
						className="h-6 text-xs text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/20 gap-1.5"
					>
						<Settings className="h-3 w-3" />
						Administration
					</Button>
				</Link>
			</div>

			{/* Header */}
			<header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
				<div className="container mx-auto px-4">
					<div className="flex h-20 items-center justify-between gap-4">
						{/* Mobile Menu & Logo */}
						<div className="flex items-center gap-4">
							<Button variant="ghost" size="icon" className="md:hidden">
								<Menu className="h-5 w-5" />
							</Button>
							<Link to="/" className="flex items-center gap-2 group">
								<div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
									<Package className="h-5 w-5" />
								</div>
								<span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
									TechStore
								</span>
							</Link>
						</div>

						{/* Desktop Navigation */}
						<nav className="hidden md:flex items-center space-x-8">
							<Link
								to="/"
								className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
							>
								Accueil
							</Link>
							<Link
								to="/products"
								className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
							>
								Produits
							</Link>
							<Link
								to="/orders"
								className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
							>
								Mes commandes
							</Link>
						</nav>

						{/* Search Bar (Hidden on small mobile) */}
						<div className="hidden sm:flex max-w-sm w-full relative">
							<div className="relative w-full">
								<input
									type="text"
									placeholder="Rechercher un produit..."
									className="w-full h-10 pl-10 pr-4 rounded-full border border-input bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
								/>
								<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
							</div>
						</div>

						{/* Actions */}
						<div className="flex items-center gap-2">
							<Link to="/cart">
								<Button
									variant="ghost"
									size="icon"
									className="relative hover:bg-muted/50 transition-colors"
								>
									<ShoppingCart className="h-5 w-5" />
									{itemCount > 0 && (
										<span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm ring-2 ring-background animate-in zoom-in">
											{itemCount}
										</span>
									)}
									<span className="sr-only">Ouvrir le panier</span>
								</Button>
							</Link>

							<Link to="/orders">
								<Button variant="ghost" size="icon" className="hover:bg-muted/50">
									<User className="h-5 w-5" />
									<span className="sr-only">Mes commandes</span>
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-1 w-full">
				<Outlet />
			</main>

			{/* Footer */}
			<footer className="border-t bg-white dark:bg-slate-900 mt-auto">
				<div className="container mx-auto px-4 py-12">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div>
							<h3 className="font-bold text-lg mb-4 flex items-center gap-2">
								<Package className="h-5 w-5 text-primary" />
								TechStore
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Votre boutique en ligne spécialisée en produits informatiques :
								smartphones, ordinateurs, caméras et accessoires tech de
								qualité.
							</p>
						</div>

						<div>
							<h4 className="font-semibold mb-4 text-foreground">Boutique</h4>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>
									<Link
										to="/products"
										className="hover:text-primary transition-colors"
									>
										Tous les produits
									</Link>
								</li>
								<li>
									<Link
										to="/categories"
										className="hover:text-primary transition-colors"
									>
										Catégories
									</Link>
								</li>
								<li>
									<Link to="#" className="hover:text-primary transition-colors">
										Nouveautés
									</Link>
								</li>
							</ul>
						</div>

						<div>
							<h4 className="font-semibold mb-4 text-foreground">Support</h4>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>
									<Link to="#" className="hover:text-primary transition-colors">
										Centre d'aide
									</Link>
								</li>
								<li>
									<Link to="#" className="hover:text-primary transition-colors">
										Livraison & Retours
									</Link>
								</li>
								<li>
									<Link to="#" className="hover:text-primary transition-colors">
										Contactez-nous
									</Link>
								</li>
							</ul>
						</div>

						<div>
							<h4 className="font-semibold mb-4 text-foreground">
								Restez informé
							</h4>
							<p className="text-sm text-muted-foreground mb-4">
								Inscrivez-vous à notre newsletter pour les dernières nouveautés
								tech.
							</p>
							<div className="flex gap-2">
								<input
									placeholder="Votre email"
									className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-primary"
								/>
								<Button size="sm">S'inscrire</Button>
							</div>
						</div>
					</div>

					<div className="border-t mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
						<p className="text-sm text-muted-foreground">
							© {new Date().getFullYear()} TechStore. Tous droits réservés.
						</p>
						<Link to="/admin">
							<Button variant="ghost" size="sm" className="text-xs gap-2">
								<Settings className="h-3 w-3" />
								Accès Admin
							</Button>
						</Link>
					</div>
				</div>
			</footer>
		</div>
	);
}

/**
 * Layout pour le storefront client
 * Mock user stocké dans un cookie (eshop_mock_user)
 */
export default function ClientLayout() {
	return (
		<MockUserProvider>
			<ClientLayoutContent />
		</MockUserProvider>
	);
}
