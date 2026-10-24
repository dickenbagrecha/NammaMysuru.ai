import { db } from "./db";
import { touristSpots, restaurants, type TouristSpot, type Restaurant, type InsertTouristSpot, type InsertRestaurant } from "@shared/schema";
import { eq, like, and, type SQL } from "drizzle-orm";

export interface IStorage {
  // Tourist Spots
  getTouristSpots(): Promise<TouristSpot[]>;
  getTouristSpot(id: number): Promise<TouristSpot | undefined>;
  createTouristSpot(spot: InsertTouristSpot): Promise<TouristSpot>;
  clearTouristSpots(): Promise<void>;

  // Restaurants
  getRestaurants(filters?: {
    cuisine?: string;
    priceRange?: string;
    isVegetarian?: boolean;
    dietaryClassification?: string;
    category?: string;
    neighbourhood?: string;
    isVeganFriendly?: boolean;
    isJainFriendly?: boolean;
    search?: string;
    minRating?: number;
  }): Promise<Restaurant[]>;
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  clearRestaurants(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Tourist Spots
  async getTouristSpots(): Promise<TouristSpot[]> {
    return await db.select().from(touristSpots);
  }

  async getTouristSpot(id: number): Promise<TouristSpot | undefined> {
    const [spot] = await db.select().from(touristSpots).where(eq(touristSpots.id, id));
    return spot;
  }

  async createTouristSpot(spot: InsertTouristSpot): Promise<TouristSpot> {
    const [newSpot] = await db.insert(touristSpots).values(spot).returning();
    return newSpot;
  }

  async clearTouristSpots(): Promise<void> {
    await db.delete(touristSpots);
  }

  // Restaurants
  async getRestaurants(filters?: {
    cuisine?: string;
    priceRange?: string;
    isVegetarian?: boolean;
    dietaryClassification?: string;
    category?: string;
    neighbourhood?: string;
    isVeganFriendly?: boolean;
    isJainFriendly?: boolean;
    search?: string;
    minRating?: number;
  }): Promise<Restaurant[]> {
    const conditions: SQL[] = [];

    if (filters?.cuisine) {
      conditions.push(like(restaurants.cuisine, `%${filters.cuisine}%`));
    }
    if (filters?.priceRange) {
      conditions.push(eq(restaurants.priceRange, filters.priceRange));
    }
    // Legacy isVegetarian filter (kept for backwards compat)
    if (filters?.isVegetarian !== undefined) {
      conditions.push(eq(restaurants.isVegetarian, filters.isVegetarian));
    }
    // New dietary classification filter
    if (filters?.dietaryClassification) {
      conditions.push(eq(restaurants.dietaryClassification, filters.dietaryClassification));
    }
    if (filters?.category) {
      conditions.push(eq(restaurants.category, filters.category));
    }
    if (filters?.neighbourhood) {
      conditions.push(like(restaurants.neighbourhood, `%${filters.neighbourhood}%`));
    }
    if (filters?.isVeganFriendly !== undefined) {
      conditions.push(eq(restaurants.isVeganFriendly, filters.isVeganFriendly));
    }
    if (filters?.isJainFriendly !== undefined) {
      conditions.push(eq(restaurants.isJainFriendly, filters.isJainFriendly));
    }
    if (filters?.minRating !== undefined) {
      // Use gte from drizzle
      const { gte } = await import("drizzle-orm");
      conditions.push(gte(restaurants.rating, filters.minRating));
    }

    let results: Restaurant[];
    if (conditions.length > 0) {
      results = await db.select().from(restaurants).where(and(...conditions));
    } else {
      results = await db.select().from(restaurants);
    }

    // Search filter (applied in-memory after DB fetch for multi-field support)
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter((r) =>
        [r.name, r.cuisine, r.location, r.neighbourhood, r.description, r.category]
          .some((f) => f?.toLowerCase().includes(q))
      );
    }

    return results;
  }

  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return restaurant;
  }

  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const [newRestaurant] = await db.insert(restaurants).values(restaurant).returning();
    return newRestaurant;
  }

  async clearRestaurants(): Promise<void> {
    await db.delete(restaurants);
  }
}

export const storage = new DatabaseStorage();

