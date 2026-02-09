# Architecture du Frontend Eshop Ynov

## 📐 Vue d'Ensemble

Ce document décrit l'architecture du frontend Eshop Ynov, basée sur une approche modulaire et orientée domaine.

## 🏛️ Principes Architecturaux

### 1. Separation of Concerns (Séparation des Préoccupations)

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  (Components, Routes, UI)               │
├─────────────────────────────────────────┤
│           Business Logic Layer          │
│  (Services, Hooks, State Management)    │
├─────────────────────────────────────────┤
│           Data Access Layer             │
│  (API Client, Services)                 │
├─────────────────────────────────────────┤
│           External API                  │
│  (Backend .NET API)                     │
└─────────────────────────────────────────┘
```

### 2. Domain-Driven Design (DDD)

Chaque domaine métier (Catalog, Basket, Order, etc.) a sa propre structure :

```
Domain/
├── services/           # Services API
├── types/             # Types TypeScript
├── hooks/             # Hooks React custom
└── utils/             # Utilitaires spécifiques
```

### 3. Client-Server Architecture avec SSR

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Browser    │ ◄─────► │ React Router │ ◄─────► │  Backend API │
│   (Client)   │   HTML  │   SSR Server │  HTTP   │    (.NET)    │
└──────────────┘         └──────────────┘         └──────────────┘
```

## 🔧 Couche d'Accès aux Données

### API Client Réutilisable

La classe `ApiClient` est la base de toutes les communications avec le backend.

```typescript
// Architecture du Client API
ApiClient
├── Configuration (baseURL, timeout, headers)
├── Request Builder (buildUrl, params)
├── Fetch Handler (timeout, abort)
├── Response Handler (JSON parsing, errors)
└── HTTP Methods
    ├── GET     (read)
    ├── POST    (create)
    ├── PUT     (update full)
    ├── DELETE  (remove)
    └── PATCH   (update partial)
```

**Flow d'une Requête :**

```
1. Service appelle ApiClient.get()
2. ApiClient construit l'URL avec params
3. Fetch avec timeout et abort controller
4. Parse la réponse (JSON/text)
5. Vérifie les erreurs HTTP
6. Retourne ApiResponse<T> typée
7. Service retourne la donnée au composant
```

### Services par Domaine

Chaque service encapsule la logique d'un domaine spécifique.

**Structure d'un Service :**

```typescript
export class DomainApiService {
  private apiClient: ApiClient;

  constructor(apiClient?: ApiClient) {
    this.apiClient = apiClient || createApiClient();
  }

  // Méthodes publiques qui utilisent apiClient
  async get...()
  async create...()
  async update...()
  async delete...()
}

// Instance singleton exportée
export const domainApiService = new DomainApiService();
```

**Avantages :**

- ✅ **Testabilité** : Injection de dépendances (ApiClient mocké)
- ✅ **Réutilisabilité** : Même service partout dans l'app
- ✅ **Type Safety** : Types TypeScript pour toutes les méthodes
- ✅ **Maintenabilité** : Logique centralisée par domaine
- ✅ **Documentation** : JSDoc sur chaque méthode

## 🎨 Couche de Présentation

### Structure des Composants

```
components/
├── ui/                # Composants génériques (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
├── client/            # Composants du Storefront
│   ├── product-card.tsx
│   ├── cart-item.tsx
│   └── ...
└── admin/             # Composants du Back-office
    ├── product-table.tsx
    ├── dashboard-stats.tsx
    └── ...
```

**Principe de Composition :**

```typescript
// Composant atomique (ui)
<Button />

// Composant moléculaire (composé)
<ProductCard>
  <Card>
    <CardHeader>
      <CardTitle />
    </CardHeader>
    <CardContent />
    <CardFooter>
      <Button />
    </CardFooter>
  </Card>
</ProductCard>

// Composant organisme (page)
<ProductList>
  {products.map(p => <ProductCard product={p} />)}
</ProductList>
```

### Routes avec Loaders SSR

**Pattern Route + Loader :**

```typescript
// 1. Loader : Charge les données côté serveur
export async function loader({ request, params }: Route.LoaderArgs) {
  const data = await service.getData();
  return { data };
}

// 2. Component : Reçoit les données pré-chargées
export default function Page({ loaderData }: Route.ComponentProps) {
  const { data } = loaderData;
  return <div>{/* Utilise data */}</div>;
}
```

**Avantages du SSR :**

- 🚀 **Performance** : Premier rendu ultra-rapide
- 🔍 **SEO** : Contenu visible par les moteurs de recherche
- ♿ **Accessibilité** : Contenu disponible sans JS
- 🌐 **Universal** : Même code client/serveur

## 🔄 Flow de Données

### GET - Récupération de Données

```
┌────────────┐
│   Route    │ loader() déclenché par navigation
│   Loader   │
└─────┬──────┘
      │
      ▼
┌────────────┐
│  Service   │ catalogService.getProducts()
│   API      │
└─────┬──────┘
      │
      ▼
┌────────────┐
│ ApiClient  │ apiClient.get<Product[]>()
└─────┬──────┘
      │
      ▼
┌────────────┐
│  Fetch     │ fetch('http://api/products')
│   HTTP     │
└─────┬──────┘
      │
      ▼
┌────────────┐
│  Backend   │ Traite la requête
│   (.NET)   │
└─────┬──────┘
      │
      ▼
┌────────────┐
│  Response  │ JSON avec liste de produits
└─────┬──────┘
      │
      ▼
┌────────────┐
│ Component  │ Reçoit loaderData, affiche
└────────────┘
```

### POST - Création de Données

```
┌────────────┐
│ Component  │ handleSubmit() avec form data
└─────┬──────┘
      │
      ▼
┌────────────┐
│  Service   │ catalogService.createProduct(data)
│   API      │
└─────┬──────┘
      │
      ▼
┌────────────┐
│ ApiClient  │ apiClient.post<Product>(url, data)
└─────┬──────┘
      │
      ▼
┌────────────┐
│  Fetch     │ fetch('http://api/products', { method: POST })
│   HTTP     │
└─────┬──────┘
      │
      ▼
┌────────────┐
│  Backend   │ Crée le produit en DB
│   (.NET)   │
└─────┬──────┘
      │
      ▼
┌────────────┐
│  Response  │ { id: "new-id" }
└─────┬──────┘
      │
      ▼
┌────────────┐
│ Component  │ Met à jour UI, redirect, etc.
└────────────┘
```

## 🧩 Patterns de Conception

### 1. Factory Pattern

```typescript
// Factory pour créer des instances configurées
export const createApiClient = (config?: Partial<ApiConfig>): ApiClient => {
  const defaultConfig = {
    baseURL: process.env.VITE_API_BASE_URL || "http://localhost:5000",
    timeout: 30000,
  };
  return new ApiClient(defaultConfig);
};
```

### 2. Singleton Pattern

```typescript
// Instance unique partagée dans l'app
export const catalogApiService = new CatalogApiService();
```

### 3. Dependency Injection

```typescript
// Injection du client API pour les tests
const mockClient = new ApiClient({ baseURL: "http://mock" });
const service = new CatalogApiService(mockClient);
```

### 4. Repository Pattern

```typescript
// Services API = Repositories pour les données
class CatalogApiService {
  async getById(id: string) { /* ... */ }
  async getAll() { /* ... */ }
  async create(data) { /* ... */ }
  async update(id, data) { /* ... */ }
  async delete(id) { /* ... */ }
}
```

## 🔐 Gestion des Erreurs

### Hiérarchie des Erreurs

```
Error (native)
└── ApiError (custom)
    ├── message: string
    ├── status: number
    ├── statusText: string
    └── data?: any
```

### Flow de Gestion

```typescript
try {
  const response = await service.getData();
  // Success
} catch (error) {
  if (error instanceof ApiError) {
    // Erreur API structurée
    switch (error.status) {
      case 404: // Not Found
      case 401: // Unauthorized
      case 500: // Server Error
    }
  } else {
    // Erreur réseau ou autre
  }
}
```

## 📦 Extension du Système

### Ajouter un Nouveau Domaine

**Exemple : Ajouter le domaine "Order"**

#### 1. Créer les Types

```typescript
// app/lib/api/services/orderApi.service.ts

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export enum OrderStatus {
  Pending = "pending",
  Processing = "processing",
  Shipped = "shipped",
  Delivered = "delivered",
  Cancelled = "cancelled",
}
```

#### 2. Créer le Service

```typescript
export class OrderApiService {
  private apiClient: ApiClient;

  constructor(apiClient?: ApiClient) {
    this.apiClient = apiClient || createApiClient();
  }

  // GET - Liste des commandes
  async getOrders(userId: string): Promise<ApiResponse<Order[]>> {
    return this.apiClient.get<Order[]>(`/orders`, {
      params: { userId },
    });
  }

  // GET - Détail d'une commande
  async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    return this.apiClient.get<Order>(`/orders/${orderId}`);
  }

  // POST - Créer une commande
  async createOrder(order: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return this.apiClient.post<Order>("/orders", order);
  }

  // PUT - Mettre à jour le statut
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<ApiResponse<Order>> {
    return this.apiClient.put<Order>(`/orders/${orderId}/status`, {
      status,
    });
  }

  // DELETE - Annuler une commande
  async cancelOrder(orderId: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete(`/orders/${orderId}`);
  }
}

export const orderApiService = new OrderApiService();
```

#### 3. Créer les Composants

```typescript
// app/components/client/order-card.tsx
export function OrderCard({ order }: { order: Order }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order #{order.id}</CardTitle>
      </CardHeader>
      {/* ... */}
    </Card>
  );
}
```

#### 4. Créer les Routes

```typescript
// app/routes/client/orders.tsx
export async function loader({ request }: Route.LoaderArgs) {
  const userId = "user123"; // TODO: from auth
  const response = await orderApiService.getOrders(userId);
  return { orders: response.data };
}

export default function Orders({ loaderData }: Route.ComponentProps) {
  const { orders } = loaderData;
  return (
    <div>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
```

## 🎯 Best Practices

### 1. Typage Strict

```typescript
// ✅ Bon : Types explicites
async getProduct(id: string): Promise<ApiResponse<Product>> {
  return this.apiClient.get<Product>(`/products/${id}`);
}

// ❌ Mauvais : Types any
async getProduct(id: any): Promise<any> {
  return this.apiClient.get(`/products/${id}`);
}
```

### 2. Gestion des Erreurs

```typescript
// ✅ Bon : Gestion des erreurs
try {
  const response = await service.getData();
  return { data: response.data };
} catch (error) {
  console.error("Error:", error);
  return { data: null, error: "Failed to load" };
}

// ❌ Mauvais : Pas de gestion
const response = await service.getData();
return { data: response.data };
```

### 3. Loading States

```typescript
// ✅ Bon : États de chargement
const [loading, setLoading] = useState(true);
const [data, setData] = useState(null);

useEffect(() => {
  setLoading(true);
  service.getData()
    .then(res => setData(res.data))
    .finally(() => setLoading(false));
}, []);

if (loading) return <Spinner />;
return <div>{data}</div>;
```

### 4. Composants Réutilisables

```typescript
// ✅ Bon : Props typées, réutilisable
interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  variant?: "default" | "compact";
}

export function ProductCard({
  product,
  onAddToCart,
  variant = "default"
}: ProductCardProps) {
  // ...
}

// ❌ Mauvais : Props non typées, spécifique
export function ProductCard({ product }: any) {
  // Logique spécifique non réutilisable
}
```

## 🚀 Performance

### 1. SSR pour le Premier Rendu

```typescript
// Chargement côté serveur = rapide
export async function loader() {
  const data = await service.getData();
  return { data }; // Pré-rendu HTML avec données
}
```

### 2. Code Splitting

```typescript
// Lazy loading des routes
const AdminDashboard = lazy(() => import("./routes/admin/dashboard"));
```

### 3. Memoization

```typescript
// Éviter les re-renders inutiles
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);
```

## 📊 Monitoring & Debug

### Logs Structurés

```typescript
console.log(`[${service.name}] Fetching data from ${endpoint}`);
console.error(`[${service.name}] Error:`, error);
```

### DevTools

- **React DevTools** : Inspecter les composants
- **Network Tab** : Voir les requêtes HTTP
- **Console** : Logs et erreurs

## 🔮 Évolutions Futures

### Phase 1 : Authentification
- Service AuthAPI
- JWT tokens
- Protected routes
- User context

### Phase 2 : État Global
- Redux ou Zustand
- Store pour Basket
- Optimistic updates

### Phase 3 : Temps Réel
- WebSockets
- Live notifications
- Stock updates

### Phase 4 : Cache & Offline
- Service Worker
- Cache API
- Offline mode

## 📚 Ressources

- [React Router v7 Docs](https://reactrouter.com)
- [TailwindCSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [TypeScript](https://www.typescriptlang.org)

---

**Maintenu par** : Équipe Eshop Ynov
**Dernière mise à jour** : 2025
