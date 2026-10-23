import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { conversations, messages } from "./models/chat";

// Re-export chat models
export * from "./models/chat";

// Tourist Spots
export const touristSpots = sqliteTable("tourist_spots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  visitingHours: text("visiting_hours"),
  ticketPrice: text("ticket_price"),
});

// Restaurants
export const restaurants = sqliteTable("restaurants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  cuisine: text("cuisine").notNull(),
  priceRange: text("price_range").notNull(),
  rating: integer("rating").default(0),
  isVegetarian: integer("is_vegetarian", { mode: "boolean" }).default(false),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
});

// Zod Schemas
export const insertTouristSpotSchema = createInsertSchema(touristSpots).omit({ id: true });
export const insertRestaurantSchema = createInsertSchema(restaurants).omit({ id: true });

// Types
export type TouristSpot = typeof touristSpots.$inferSelect;
export type InsertTouristSpot = z.infer<typeof insertTouristSpotSchema>;

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;

// Request Types
export type CreateTouristSpotRequest = InsertTouristSpot;
export type CreateRestaurantRequest = InsertRestaurant;

// Chat Types (Helpers for frontend)
export type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
};
