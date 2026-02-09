import type { Route } from "./+types/dashboard";
import { catalogApiService } from "~/lib/api/services/catalog-api.service";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  ShoppingCart,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from "lucide-react";
import { Button } from "~/components/ui/button";

/**
 * Loader pour charger les statistiques du dashboard
 */
export async function loader() {
  try {
    const productsResponse = await catalogApiService.getProducts(0, 100);

    // Calculate statistics
    const products = productsResponse.data.data;
    const totalProducts = productsResponse.data.count ?? productsResponse.data.totalCount ?? 0;
    const averagePrice =
      products.reduce((sum, p) => sum + p.price, 0) / products.length || 0;

    // Mock additional stats (in real app, fetch from respective APIs)
    const stats = {
      totalProducts,
      averagePrice,
      totalCategories: new Set(products.flatMap((p) => p.categories)).size,
      totalRevenue: 45231.89,
      revenueChange: 12.5,
      totalOrders: 156,
      ordersChange: -3.2,
      totalCustomers: 892,
      customersChange: 8.1,
    };

    return {
      stats,
      recentProducts: products.slice(0, 5),
    };
  } catch (error) {
    console.error("Error loading dashboard:", error);
    return {
      stats: {
        totalProducts: 0,
        averagePrice: 0,
        totalCategories: 0,
        totalRevenue: 0,
        revenueChange: 0,
        totalOrders: 0,
        ordersChange: 0,
        totalCustomers: 0,
        customersChange: 0,
      },
      recentProducts: [],
      error: "Échec du chargement des données",
    };
  }
}

/**
 * Dashboard administrateur
 * Affiche les statistiques et aperçu du site
 */
export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { stats, recentProducts, error } = loaderData;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Chiffre d'affaires",
      value: `${stats.totalRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
      change: stats.revenueChange,
      icon: DollarSign,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-950",
    },
    {
      title: "Commandes",
      value: stats.totalOrders.toString(),
      change: stats.ordersChange,
      icon: ShoppingCart,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-950",
    },
    {
      title: "Produits",
      value: stats.totalProducts.toString(),
      change: 0,
      icon: Package,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-950",
    },
    {
      title: "Clients",
      value: stats.totalCustomers.toString(),
      change: stats.customersChange,
      icon: Users,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-950",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            Tableau de bord
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Bon retour ! Voici ce qui se passe avec votre boutique aujourd'hui.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
            Télécharger le rapport
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/30">
            <TrendingUp className="h-4 w-4 mr-2" />
            Voir les statistiques
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change > 0;
          const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;

          return (
            <Card key={stat.title} className="overflow-hidden border-slate-200/50 dark:border-slate-800/50 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-3 rounded-xl ${stat.bgColor} shadow-sm`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                {stat.change !== 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <ChangeIcon className={`h-4 w-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(stat.change)}%
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">vs mois dernier</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Products - Takes up more space */}
        <Card className="lg:col-span-4 border-slate-200/50 dark:border-slate-800/50 shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
            <div>
              <CardTitle className="text-xl font-bold">Produits récents</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Vos derniers produits ajoutés
              </p>
            </div>
            <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {recentProducts.length > 0 ? (
              <div className="space-y-3">
                {recentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-r from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 hover:shadow-md transition-all duration-200 hover:border-primary/30"
                  >
                    <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 ring-1 ring-slate-200/50 dark:ring-slate-700/50">
                      <img
                        src={product.imageFile?.startsWith("http") || product.imageFile?.startsWith("/") ? product.imageFile : `/${product.imageFile}`}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-product.svg";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {product.categories.slice(0, 2).map((cat) => (
                          <span 
                            key={cat}
                            className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-slate-900 dark:text-white">{product.price.toFixed(2)} €</p>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">En stock</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">Aucun produit</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Quick Stats */}
        <div className="lg:col-span-3 space-y-6">
          {/* Category Stats */}
          <Card className="border-slate-200/50 dark:border-slate-800/50 shadow-lg bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm">
            <CardHeader className="border-b border-slate-200/50 dark:border-slate-800/50">
              <CardTitle className="text-lg font-bold">Catégories</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-slate-900/50">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total catégories</span>
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalCategories}</span>
                </div>
                <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/50 dark:bg-slate-900/50">
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Prix moyen</span>
                    <span className="text-lg font-bold text-primary">
                      {stats.averagePrice.toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-slate-200/50 dark:border-slate-800/50 shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-200/50 dark:border-slate-800/50">
              <CardTitle className="text-lg font-bold">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-6">
              <Button variant="outline" className="w-full justify-start h-12 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-primary/30 transition-all">
                <Package className="h-5 w-5 mr-3 text-primary" />
                <span className="font-medium">Ajouter un produit</span>
              </Button>
              <Button variant="outline" className="w-full justify-start h-12 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-primary/30 transition-all">
                <ShoppingCart className="h-5 w-5 mr-3 text-primary" />
                <span className="font-medium">Voir les commandes</span>
              </Button>
              <Button variant="outline" className="w-full justify-start h-12 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-primary/30 transition-all">
                <Users className="h-5 w-5 mr-3 text-primary" />
                <span className="font-medium">Gérer les clients</span>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-slate-200/50 dark:border-slate-800/50 shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-200/50 dark:border-slate-800/50">
              <CardTitle className="text-lg font-bold">Activité récente</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500 mt-2 shadow-lg shadow-green-500/50" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Nouvelle commande reçue</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Il y a 2 minutes</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mt-2 shadow-lg shadow-blue-500/50" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Produit mis à jour</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Il y a 1 heure</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-2.5 w-2.5 rounded-full bg-purple-500 mt-2 shadow-lg shadow-purple-500/50" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Nouveau client inscrit</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Il y a 3 heures</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
