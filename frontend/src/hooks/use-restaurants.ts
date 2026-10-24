import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { getApiUrl } from "@/lib/api";
import { z } from "zod";

type FilterParams = z.infer<NonNullable<typeof api.restaurants.list.input>>;

export function useRestaurants(filters?: FilterParams) {
  const queryKey = [api.restaurants.list.path, filters];

  return useQuery({
    queryKey,
    queryFn: async () => {
      let url = api.restaurants.list.path;
      if (filters) {
        const params = new URLSearchParams();
        if (filters.cuisine) params.append("cuisine", filters.cuisine);
        if (filters.priceRange) params.append("priceRange", filters.priceRange);
        if (filters.isVegetarian !== undefined)
          params.append("isVegetarian", String(filters.isVegetarian));
        if (filters.dietaryClassification)
          params.append("dietaryClassification", filters.dietaryClassification);
        if (filters.category) params.append("category", filters.category);
        if (filters.neighbourhood)
          params.append("neighbourhood", filters.neighbourhood);
        if (filters.isVeganFriendly !== undefined)
          params.append("isVeganFriendly", String(filters.isVeganFriendly));
        if (filters.isJainFriendly !== undefined)
          params.append("isJainFriendly", String(filters.isJainFriendly));
        if (filters.search) params.append("search", filters.search);
        if (filters.minRating !== undefined)
          params.append("minRating", String(filters.minRating));
        const qs = params.toString();
        if (qs) url += `?${qs}`;
      }

      const res = await fetch(getApiUrl(url));
      if (!res.ok) throw new Error("Failed to fetch restaurants");
      return api.restaurants.list.responses[200].parse(await res.json());
    },
    staleTime: 1000,
  });
}

export function useRestaurant(id: number) {
  return useQuery({
    queryKey: [api.restaurants.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.restaurants.get.path, { id });
      const res = await fetch(getApiUrl(url));
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch restaurant");
      }
      return api.restaurants.get.responses[200].parse(await res.json());
    },
    staleTime: 5 * 60 * 1000,
  });
}
