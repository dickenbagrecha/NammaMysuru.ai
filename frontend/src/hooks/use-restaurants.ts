import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

type FilterParams = z.infer<NonNullable<typeof api.restaurants.list.input>>;

export function useRestaurants(filters?: FilterParams) {
  // Create a stable query key from filters
  const queryKey = [api.restaurants.list.path, filters];

  return useQuery({
    queryKey,
    queryFn: async () => {
      // Manually construct query string since buildUrl is for path params
      let url = api.restaurants.list.path;
      if (filters) {
        const params = new URLSearchParams();
        if (filters.cuisine) params.append("cuisine", filters.cuisine);
        if (filters.priceRange) params.append("priceRange", filters.priceRange);
        if (filters.isVegetarian !== undefined) params.append("isVegetarian", String(filters.isVegetarian));
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch restaurants");
      return api.restaurants.list.responses[200].parse(await res.json());
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRestaurant(id: number) {
  return useQuery({
    queryKey: [api.restaurants.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.restaurants.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch restaurant");
      }
      return api.restaurants.get.responses[200].parse(await res.json());
    },
    staleTime: 5 * 60 * 1000,
  });
}
