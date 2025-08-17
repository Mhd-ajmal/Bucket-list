import { z } from "zod";

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  emoji: z.string(),
  isDefault: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
});

export const wishlistItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  price: z.number().optional(),
  notes: z.string().optional(),
  categoryId: z.string(),
  imageBlob: z.instanceof(Blob).optional(),
  imageUrl: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  order: z.number().default(0),
});

export const appSettingsSchema = z.object({
  theme: z.enum(['light', 'dark']).default('light'),
  gridView: z.enum(['list', 'grid-2', 'grid-3']).default('list'),
  selectedCategoryId: z.string().optional(),
});

export type Category = z.infer<typeof categorySchema>;
export type WishlistItem = z.infer<typeof wishlistItemSchema>;
export type AppSettings = z.infer<typeof appSettingsSchema>;

export type InsertCategory = Omit<Category, 'id' | 'createdAt'>;
export type InsertWishlistItem = Omit<WishlistItem, 'id' | 'createdAt' | 'updatedAt' | 'order'>;
export type InsertAppSettings = Partial<AppSettings>;
