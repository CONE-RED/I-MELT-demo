import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Heat model
export const heats = pgTable("heats", {
  id: serial("id").primaryKey(),
  heatNumber: integer("heat_number").notNull().unique(),
  ts: timestamp("timestamp").notNull(),
  grade: text("grade").notNull(),
  master: text("master").notNull(),
  operator: text("operator").notNull(),
  modelStatus: text("model_status").notNull().default("idle"),
  confidence: integer("confidence").notNull().default(75),
  data: json("data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertHeatSchema = createInsertSchema(heats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Bucket model
export const buckets = pgTable("buckets", {
  id: serial("id").primaryKey(),
  heatId: integer("heat_id").notNull(),
  bucketNumber: integer("bucket_number").notNull(),
  totalWeight: integer("total_weight").notNull(),
  data: json("data").notNull(),
});

export const insertBucketSchema = createInsertSchema(buckets).omit({
  id: true,
});

// Stage model
export const stages = pgTable("stages", {
  id: serial("id").primaryKey(),
  heatId: integer("heat_id").notNull(),
  bucketId: integer("bucket_id").notNull(),
  stageNumber: integer("stage_number").notNull(),
  plannedEnergy: integer("planned_energy").notNull(),
  actualEnergy: integer("actual_energy"),
  plannedTime: text("planned_time").notNull(),
  actualTime: text("actual_time"),
  profile: integer("profile").notNull(),
  temp: integer("temp"),
  status: text("status").notNull(),
});

export const insertStageSchema = createInsertSchema(stages).omit({
  id: true,
});

// Additive model
export const additives = pgTable("additives", {
  id: serial("id").primaryKey(),
  heatId: integer("heat_id").notNull(),
  bucketId: integer("bucket_id").notNull(),
  stageId: integer("stage_id").notNull(),
  name: text("name").notNull(),
  weight: integer("weight").notNull(),
  energy: integer("energy").notNull(),
});

export const insertAdditiveSchema = createInsertSchema(additives).omit({
  id: true,
});

// Insight model
export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  heatId: integer("heat_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  acknowledged: boolean("acknowledged").notNull().default(false),
  actionable: boolean("actionable").notNull().default(false),
});

export const insertInsightSchema = createInsertSchema(insights).omit({
  id: true,
  timestamp: true,
});

// Chemistry model
export const chemistry = pgTable("chemistry", {
  id: serial("id").primaryKey(),
  heatId: integer("heat_id").notNull(),
  type: text("type").notNull(), // 'steel' or 'slag'
  data: json("data").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertChemistrySchema = createInsertSchema(chemistry).omit({
  id: true,
  timestamp: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertHeat = z.infer<typeof insertHeatSchema>;
export type Heat = typeof heats.$inferSelect;

export type InsertBucket = z.infer<typeof insertBucketSchema>;
export type Bucket = typeof buckets.$inferSelect;

export type InsertStage = z.infer<typeof insertStageSchema>;
export type Stage = typeof stages.$inferSelect;

export type InsertAdditive = z.infer<typeof insertAdditiveSchema>;
export type Additive = typeof additives.$inferSelect;

export type InsertInsight = z.infer<typeof insertInsightSchema>;
export type Insight = typeof insights.$inferSelect;

export type InsertChemistry = z.infer<typeof insertChemistrySchema>;
export type Chemistry = typeof chemistry.$inferSelect;

// Define relationships between tables
export const usersRelations = relations(users, ({ many }) => ({
  heats: many(heats),
}));

export const heatsRelations = relations(heats, ({ many, one }) => ({
  buckets: many(buckets),
  stages: many(stages),
  additives: many(additives),
  insights: many(insights),
  chemistry: many(chemistry)
}));

export const bucketsRelations = relations(buckets, ({ one, many }) => ({
  heat: one(heats, {
    fields: [buckets.heatId],
    references: [heats.id],
  }),
  stages: many(stages),
  additives: many(additives)
}));

export const stagesRelations = relations(stages, ({ one }) => ({
  heat: one(heats, {
    fields: [stages.heatId],
    references: [heats.id],
  }),
  bucket: one(buckets, {
    fields: [stages.bucketId],
    references: [buckets.id],
  })
}));

export const additivesRelations = relations(additives, ({ one }) => ({
  heat: one(heats, {
    fields: [additives.heatId],
    references: [heats.id],
  }),
  bucket: one(buckets, {
    fields: [additives.bucketId],
    references: [buckets.id],
  })
}));

export const insightsRelations = relations(insights, ({ one }) => ({
  heat: one(heats, {
    fields: [insights.heatId],
    references: [heats.id],
  })
}));

export const chemistryRelations = relations(chemistry, ({ one }) => ({
  heat: one(heats, {
    fields: [chemistry.heatId],
    references: [heats.id],
  })
}));
