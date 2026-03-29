import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Client Routes (Storefront) avec layout
  layout("routes/client-layout.tsx", [
    index("routes/client/home.tsx"),
    route("products", "routes/client/products.tsx"),
    route("products/:id", "routes/client/product.$id.tsx"),
    route("cart", "routes/client/cart.tsx"),
    route("checkout", "routes/client/checkout.tsx"),
    route("orders", "routes/client/orders.tsx"),
  ]),

  // Admin Routes (Back-office) avec layout
  layout("routes/admin-layout.tsx", [
    route("admin", "routes/admin/dashboard.tsx"),
    route("admin/products", "routes/admin/products.tsx"),
  ]),
] satisfies RouteConfig;
