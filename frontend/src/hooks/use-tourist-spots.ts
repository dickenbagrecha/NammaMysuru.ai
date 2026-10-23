import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useTouristSpots() {
  return useQuery({
    queryKey: [api.spots.list.path],
    queryFn: async () => {
      const res = await fetch(api.spots.list.path);
      if (!res.ok) throw new Error("Failed to fetch tourist spots");
      return api.spots.list.responses[200].parse(await res.json());
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTouristSpot(id: number) {
  return useQuery({
    queryKey: [api.spots.get.path, id],
    queryFn: async () => {
      const url = api.spots.get.path.replace(":id", id.toString());
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch tourist spot");
      }
      return api.spots.get.responses[200].parse(await res.json());
    },
    staleTime: 5 * 60 * 1000,
  });
}
