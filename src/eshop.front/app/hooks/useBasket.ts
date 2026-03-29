import { useState, useEffect, useCallback } from "react";
import { basketApiService, type Basket, type BasketItem } from "~/lib/api/services";
import { ApiError } from "~/lib/api/apiClient";

interface UseBasketResult {
  basket: Basket | null;
  loading: boolean;
  error: string | null;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItemQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearBasket: () => Promise<void>;
  refetch: () => void;
}

/**
 * Hook personnalisé pour gérer le panier d'un utilisateur
 * Fournit toutes les opérations nécessaires sur le panier
 *
 * @param userId - ID de l'utilisateur
 *
 * @example
 * const {
 *   basket,
 *   loading,
 *   addItem,
 *   removeItem
 * } = useBasket("user123");
 *
 * // Ajouter un produit
 * await addItem("product-id", 2);
 *
 * // Supprimer un produit
 * await removeItem("product-id");
 */
export function useBasket(userId: string | undefined): UseBasketResult {
  const [basket, setBasket] = useState<Basket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBasket = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await basketApiService.getBasket(userId);
      setBasket(response.data);
    } catch (err) {
      // Panier inexistant (404) → on le crée côté backend puis on affiche un panier vide
      if (err instanceof ApiError && err.status === 404) {
        try {
          const createRes = await basketApiService.upsertBasket({
            userId,
            items: [],
          });
          setBasket({
            id: createRes.data.id,
            userId: createRes.data.userId,
            items: createRes.data.items,
            totalPrice: createRes.data.totalPrice,
          });
        } catch (createErr) {
          // Création échouée → on affiche un panier vide localement (addItem créera le panier au prochain ajout)
          setBasket({
            id: userId,
            userId,
            items: [],
            totalPrice: 0,
          });
        }
      } else {
        const errorMessage = err instanceof ApiError
          ? err.status === 502
            ? "Service panier indisponible (502). Démarrez le gateway (port 6064) et le service Basket.API (Docker ou en local sur le port 5051)."
            : `Error ${err.status}: ${err.message}`
          : "Failed to load basket";
        setError(errorMessage);
        console.error("Error fetching basket:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBasket();
  }, [fetchBasket]);

  const addItem = async (productId: string, quantity: number) => {
    if (!userId) throw new Error("User ID is required");

    try {
      setError(null);
      const response = await basketApiService.addItemToBasket(userId, {
        productId,
        quantity,
      });
      setBasket(response.data as unknown as Basket);
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? `Error ${err.status}: ${err.message}`
        : "Failed to add item to basket";
      setError(errorMessage);
      throw err;
    }
  };

  const updateItemQuantity = async (productId: string, quantity: number) => {
    if (!userId) throw new Error("User ID is required");

    try {
      setError(null);
      const response = await basketApiService.updateBasketItem(userId, {
        productId,
        quantity,
      });
      setBasket(response.data as unknown as Basket);
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? `Error ${err.status}: ${err.message}`
        : "Failed to update item quantity";
      setError(errorMessage);
      throw err;
    }
  };

  const removeItem = async (productId: string) => {
    if (!userId) throw new Error("User ID is required");

    try {
      setError(null);
      const response = await basketApiService.removeItemFromBasket(userId, productId);
      setBasket(response.data as unknown as Basket);
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? `Error ${err.status}: ${err.message}`
        : "Failed to remove item from basket";
      setError(errorMessage);
      throw err;
    }
  };

  const clearBasket = async () => {
    if (!userId) throw new Error("User ID is required");

    try {
      setError(null);
      await basketApiService.clearBasket(userId);
      setBasket(null);
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? `Error ${err.status}: ${err.message}`
        : "Failed to clear basket";
      setError(errorMessage);
      throw err;
    }
  };

  return {
    basket,
    loading,
    error,
    addItem,
    updateItemQuantity,
    removeItem,
    clearBasket,
    refetch: fetchBasket,
  };
}

/**
 * Hook pour calculer le nombre total d'articles dans le panier
 */
export function useBasketItemCount(basket: Basket | null): number {
  if (!basket) return 0;
  return basket.items.reduce((total, item) => total + item.quantity, 0);
}
