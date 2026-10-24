import { z } from 'zod';
import { insertTouristSpotSchema, insertRestaurantSchema, touristSpots, restaurants } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  spots: {
    list: {
      method: 'GET' as const,
      path: '/api/tourist-spots' as const,
      responses: {
        200: z.array(z.custom<typeof touristSpots.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/tourist-spots/:id' as const,
      responses: {
        200: z.custom<typeof touristSpots.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  restaurants: {
    list: {
      method: 'GET' as const,
      path: '/api/restaurants' as const,
      input: z.object({
        cuisine: z.string().optional(),
        priceRange: z.string().optional(),
        isVegetarian: z.coerce.boolean().optional(),
        // New filter fields
        dietaryClassification: z.string().optional(), // 'pure_veg'|'veg_and_non_veg'|'non_veg'
        category: z.string().optional(),
        neighbourhood: z.string().optional(),
        isVeganFriendly: z.coerce.boolean().optional(),
        isJainFriendly: z.coerce.boolean().optional(),
        search: z.string().optional(),
        minRating: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof restaurants.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/restaurants/:id' as const,
      responses: {
        200: z.custom<typeof restaurants.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
