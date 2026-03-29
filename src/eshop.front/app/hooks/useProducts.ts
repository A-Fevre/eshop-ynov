import { useState, useEffect } from "react";
import { catalogApiService, type Product } from "~/lib/api/services";
import { ApiError } from "~/lib/api/apiClient";

interface UseProductsOptions {
  pageIndex?: number;
  pageSize?: number;
  category?: string;
}

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => void;
}

/**
 * Hook personnalisé pour charger et gérer les produits
 * Gère automatiquement le loading, les erreurs et le refresh
 *
 * @example
 * const { products, loading, error, refetch } = useProducts({
 *   pageIndex: 0,
 *   pageSize: 10
 * });
 */
export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const { pageIndex = 0, pageSize = 10, category } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = category
        ? await catalogApiService.getProductsByCategory(category, pageIndex, pageSize)
        : await catalogApiService.getProducts(pageIndex, pageSize);

      setProducts(response.data.data);
      // Fallback to totalCount if count is undefined, or 0
      setTotalCount(response.data.count ?? response.data.totalCount ?? 0);
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? `Error ${err.status}: ${err.message}`
        : "Failed to load products";
      setError(errorMessage);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [pageIndex, pageSize, category]);

  return {
    products,
    loading,
    error,
    totalCount,
    refetch: fetchProducts,
  };
}

/**
 * Hook pour charger un produit spécifique par ID
 */
export function useProduct(productId: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await catalogApiService.getProductById(productId);
        setProduct(response.data);
      } catch (err) {
        const errorMessage = err instanceof ApiError
          ? `Error ${err.status}: ${err.message}`
          : "Failed to load product";
        setError(errorMessage);
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, loading, error };
}
