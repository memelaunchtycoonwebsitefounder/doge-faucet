import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Faucet user stats - tracks daily streaks, referrals, and earnings
 */
export const faucetUserStats = mysqlTable("faucet_user_stats", {
  id: int("id").autoincrement().primaryKey(),
  /** Dogecoin address of the user */
  dogeAddress: varchar("dogeAddress", { length: 34 }).notNull().unique(),
  /** Current daily claim streak (consecutive days) */
  currentStreak: int("currentStreak").default(0).notNull(),
  /** Longest streak ever achieved */
  maxStreak: int("maxStreak").default(0).notNull(),
  /** Last claim timestamp */
  lastClaimAt: timestamp("lastClaimAt"),
  /** Total DOGE earned from claims */
  totalEarned: varchar("totalEarned", { length: 32 }).default("0").notNull(),
  /** Total DOGE earned from referrals */
  referralEarnings: varchar("referralEarnings", { length: 32 }).default("0").notNull(),
  /** Number of successful referrals */
  referralCount: int("referralCount").default(0).notNull(),
  /** Unique referral code for this user */
  referralCode: varchar("referralCode", { length: 16 }).notNull().unique(),
  /** Referrer's address (who referred this user) */
  referrerAddress: varchar("referrerAddress", { length: 34 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FaucetUserStats = typeof faucetUserStats.$inferSelect;
export type InsertFaucetUserStats = typeof faucetUserStats.$inferInsert;

/**
 * Referral tracking - records each successful referral
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  /** Referrer's Dogecoin address */
  referrerAddress: varchar("referrerAddress", { length: 34 }).notNull(),
  /** Referred user's Dogecoin address */
  referredAddress: varchar("referredAddress", { length: 34 }).notNull(),
  /** Reward amount (0.0067 DOGE) */
  rewardAmount: varchar("rewardAmount", { length: 32 }).default("0.0067").notNull(),
  /** Whether the referral reward has been paid */
  isPaid: int("isPaid").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  paidAt: timestamp("paidAt"),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

// TODO: Add your tables here
/**
 * Virtual miners - tracks user-owned miners for passive income
 */
export const miners = mysqlTable("miners", {
  id: int("id").autoincrement().primaryKey(),
  dogeAddress: varchar("dogeAddress", { length: 34 }).notNull(),
  minerType: mysqlEnum("minerType", ["basic", "standard", "premium", "elite"]).notNull(),
  cost: varchar("cost", { length: 32 }).notNull(),
  incomePerHour: varchar("incomePerHour", { length: 32 }).notNull(),
  totalIncome: varchar("totalIncome", { length: 32 }).default("0").notNull(),
  lastCollectedAt: timestamp("lastCollectedAt").defaultNow().notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Miner = typeof miners.$inferSelect;
export type InsertMiner = typeof miners.$inferInsert;

/**
 * Mining sessions - tracks active mining periods with 12-hour windows
 */
export const miningSessions = mysqlTable("mining_sessions", {
  id: int("id").autoincrement().primaryKey(),
  dogeAddress: varchar("dogeAddress", { length: 34 }).notNull(),
  sessionStartAt: timestamp("sessionStartAt").defaultNow().notNull(),
  sessionExpiresAt: timestamp("sessionExpiresAt").notNull(),
  miningRate: varchar("miningRate", { length: 32 }).notNull(),
  totalMined: varchar("totalMined", { length: 32 }).default("0").notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MiningSession = typeof miningSessions.$inferSelect;
export type InsertMiningSession = typeof miningSessions.$inferInsert;

/**
 * Miner tier upgrades - tracks upgraded miners with power multipliers
 */
export const minerUpgrades = mysqlTable("miner_upgrades", {
  id: int("id").autoincrement().primaryKey(),
  dogeAddress: varchar("dogeAddress", { length: 34 }).notNull(),
  minerId: int("minerId").notNull(),
  fromTier: mysqlEnum("fromTier", ["basic", "standard", "premium", "elite"]).notNull(),
  toTier: mysqlEnum("toTier", ["basic", "standard", "premium", "elite"]).notNull(),
  powerMultiplier: varchar("powerMultiplier", { length: 32 }).default("3").notNull(),
  upgradeCost: varchar("upgradeCost", { length: 32 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MinerUpgrade = typeof minerUpgrades.$inferSelect;
export type InsertMinerUpgrade = typeof minerUpgrades.$inferInsert;
