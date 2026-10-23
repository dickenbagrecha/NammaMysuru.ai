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
  getRestaurants(filters?: { cuisine?: string; priceRange?: string; isVegetarian?: boolean }): Promise<Restaurant[]>;
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
  async getRestaurants(filters?: { cuisine?: string; priceRange?: string; isVegetarian?: boolean }): Promise<Restaurant[]> {
    const conditions: SQL[] = [];

    if (filters?.cuisine) {
      conditions.push(like(restaurants.cuisine, `%${filters.cuisine}%`));
    }
    if (filters?.priceRange) {
      conditions.push(eq(restaurants.priceRange, filters.priceRange));
    }
    if (filters?.isVegetarian !== undefined) {
      conditions.push(eq(restaurants.isVegetarian, filters.isVegetarian));
    }

    if (conditions.length > 0) {
      return await db.select().from(restaurants).where(and(...conditions));
    }

    return await db.select().from(restaurants);
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
