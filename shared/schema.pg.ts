import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// ==========================================
// Tourist Spots Table (PostgreSQL)
// ==========================================
export const touristSpots = pgTable("tourist_spots", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  visitingHours: text("visiting_hours"),
  ticketPrice: text("ticket_price"),
});

// ==========================================
// Restaurants Table (PostgreSQL)
// ==========================================
export const restaurants = pgTable("restaurants", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: text("name").notNull(),
  cuisine: text("cuisine").notNull(),
  priceRange: text("price_range").notNull(),
  rating: integer("rating").default(0),
  isVegetarian: boolean("is_vegetarian").default(false),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  // Extended fields
  // 'pure_veg' | 'veg_and_non_veg' | 'non_veg' | 'unknown'
  dietaryClassification: text("dietary_classification"),
  // 'restaurant' | 'cafe' | 'cafeteria' | 'bakery' | 'traditional' | 'sweet_shop' | 'juice_bar'
  category: text("category"),
  neighbourhood: text("neighbourhood"),
  isVeganFriendly: boolean("is_vegan_friendly"),
  isJainFriendly: boolean("is_jain_friendly"),
  openingHours: text("opening_hours"),
  menuUrl: text("menu_url"),
  description: text("description"),
  // Provenance & verification fields (nullable, backward-compatible)
  // 'verified' | 'partially_verified' | 'unverified'
  sourceUrl: text("source_url"),
  verificationStatus: text("verification_status").default("unverified"),
  verifiedAt: text("verified_at"),
});

// ==========================================
// Conversations Table (PostgreSQL)
// ==========================================
export const conversations = pgTable("conversations", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .default(sql`now()`)
    .notNull(),
});

// ==========================================
// Messages Table (PostgreSQL)
// ==========================================
export const messages = pgTable("messages", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .default(sql`now()`)
    .notNull(),
});

// ==========================================
// Zod Schemas
// ==========================================
export const insertTouristSpotSchema = createInsertSchema(touristSpots).omit({ id: true });
export const insertRestaurantSchema = createInsertSchema(restaurants).omit({ id: true });
export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});
export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

// ==========================================
// Types
// ==========================================
export type TouristSpot = typeof touristSpots.$inferSelect;
export type InsertTouristSpot = z.infer<typeof insertTouristSpotSchema>;

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Request Types
export type CreateTouristSpotRequest = InsertTouristSpot;
export type CreateRestaurantRequest = InsertRestaurant;

// Chat Types (Helpers for frontend)
export type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
};
