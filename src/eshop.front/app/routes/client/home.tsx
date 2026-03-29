import type { Route } from "./+types/home";
import { catalogApiService } from "~/lib/api/services/catalog-api.service";
import { retry } from "~/lib/retry";
import { ProductCard } from "~/components/client/product-card";
import type { Product } from "~/lib/api/services/catalog-api.service";
import { Button } from "~/components/ui/button";
import { ArrowRight, Star, Shield, Truck, HeartHandshake, Smartphone, Laptop, Camera, Headphones } from "lucide-react";
import { Link } from "react-router";
import { useBasket } from "~/hooks/useBasket";
import { useMockUserId } from "~/contexts/mock-user-context";
import { useState } from "react";

/**
 * Loader pour charger les produits côté serveur (SSR)
 */
export async function loader() {
  try {
    const response = await retry(() => catalogApiService.getProducts(0, 12), {
      retries: 5,
      delayMs: 1000,
    });
    return {
      products: response.data.data,
      totalCount: response.data.totalCount,
    };
  } catch (error) {
    console.error("Error loading products:", error);
    return {
      products: [],
      totalCount: 0,
    };
  }
}

/**
 * Page d'accueil - Style Tech moderne
 * Design épuré avec focus sur les produits tech
 */
export default function ClientHome({ loaderData }: Route.ComponentProps) {
  const { products, totalCount } = loaderData;
  
  const userId = useMockUserId();
  const { addItem } = useBasket(userId);

  const handleAddToCart = async (product: Product) => {
    try {
      await addItem(product.id, 1);
      alert(`${product.name} ajouté au panier !`);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Échec de l'ajout au panier. Veuillez réessayer.");
    }
  };

  // Catégories tech
  const categories = [
    { icon: Smartphone, name: "Smartphones", desc: "Derniers modèles" },
    { icon: Laptop, name: "Ordinateurs", desc: "PC & Mac" },
    { icon: Camera, name: "Caméras", desc: "Photo & Vidéo" },
    { icon: Headphones, name: "Audio", desc: "Casques & Écouteurs" },
  ];

  const featuredProducts = products.slice(0, 6);

  return (
    <div className="w-full">
      {/* Hero Section - Tech Store Style */}
      <section className="bg-gradient-to-b from-primary/5 to-white dark:to-slate-950">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              TechStore
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 font-light">
              Votre boutique spécialisée en produits informatiques
            </p>
            <Link to="/products">
              <Button size="lg" className="rounded-full px-8">
                Découvrir nos produits
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nos catégories</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link 
                  key={cat.name}
                  to={`/products?category=${cat.name}`}
                  className="group relative aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 p-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
                  <div className="relative h-full flex flex-col items-center justify-center text-center">
                    <Icon className="h-16 w-16 mb-4 text-primary" />
                    <h3 className="font-semibold text-lg mb-1">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground">{cat.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Produits populaires</h2>
            <Link to="/products">
              <Button variant="outline" className="rounded-full">
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">Découvrez notre catalogue.</p>
              <Link to="/products">
                <Button variant="outline" size="sm" className="rounded-full">
                  Voir le catalogue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {products.length > 6 && (
                <div className="text-center mt-8">
                  <Link to="/products">
                    <Button variant="outline" size="lg" className="rounded-full px-8">
                      Voir tous les produits
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Feature Section 1 - Tech Quality */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="order-2 lg:order-1">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden flex items-center justify-center">
                <Laptop className="h-48 w-48 text-primary/40" />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Du matériel<br />
                <span className="text-primary">de qualité professionnelle</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Découvrez notre sélection de produits tech soigneusement choisis : smartphones dernier cri, ordinateurs performants, caméras professionnelles et accessoires indispensables.
              </p>
              <Button size="lg" className="rounded-full px-8">
                Explorer
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2 - Service */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Service client<br />
                <span className="text-primary">à votre écoute</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Notre équipe d'experts tech est là pour vous conseiller. Profitez d'une livraison rapide, d'un service après-vente réactif et d'une garantie sur tous nos produits.
              </p>
              <Button size="lg" className="rounded-full px-8">
                En savoir plus
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div>
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-secondary/20 to-accent/20 overflow-hidden flex items-center justify-center">
                <Headphones className="h-48 w-48 text-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4">
              Nos engagements
            </h2>
            <p className="text-center text-muted-foreground mb-16 text-lg">
              La qualité et le service avant tout
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-white dark:bg-slate-800 mx-auto mb-4 flex items-center justify-center shadow-sm">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Produits garantis</h3>
                <p className="text-sm text-muted-foreground">
                  Garantie 2 ans sur tous les produits
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-white dark:bg-slate-800 mx-auto mb-4 flex items-center justify-center shadow-sm">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Livraison gratuite</h3>
                <p className="text-sm text-muted-foreground">
                  Dès 50€ d'achat en France
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-white dark:bg-slate-800 mx-auto mb-4 flex items-center justify-center shadow-sm">
                  <HeartHandshake className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Retours 30 jours</h3>
                <p className="text-sm text-muted-foreground">
                  Satisfait ou remboursé
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-white dark:bg-slate-800 mx-auto mb-4 flex items-center justify-center shadow-sm">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Avis clients</h3>
                <p className="text-sm text-muted-foreground">
                  4.8/5 de satisfaction
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              Prêt à commander ?
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8">
              Découvrez notre catalogue et trouvez le produit tech qu'il vous faut
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" variant="secondary" className="rounded-full px-8">
                  Voir les produits
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="rounded-full px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                En savoir plus
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
