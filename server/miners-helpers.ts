import { getDb } from "./db";
import { miners, faucetUserStats } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

// Miner types with their properties
export const MINER_TYPES = {
  basic: {
    name: "Basic Miner",
    cost: "0.5",
    incomePerHour: "0.00005",
    description: "Entry-level miner for beginners",
  },
  standard: {
    name: "Standard Miner",
    cost: "1.5",
    incomePerHour: "0.00015",
    description: "Reliable mid-tier miner",
  },
  premium: {
    name: "Premium Miner",
    cost: "5.0",
    incomePerHour: "0.0005",
    description: "High-performance miner",
  },
  elite: {
    name: "Elite Miner",
    cost: "15.0",
    incomePerHour: "0.0015",
    description: "Top-tier miner for maximum income",
  },
};

/**
 * Purchase a miner for a user
 */
export async function purchaseMiner(
  dogeAddress: string,
  minerType: "basic" | "standard" | "premium" | "elite"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const minerConfig = MINER_TYPES[minerType];
  if (!minerConfig) throw new Error("Invalid miner type");

  // Check user balance
  const userStats = await db
    .select()
    .from(faucetUserStats)
    .where(eq(faucetUserStats.dogeAddress, dogeAddress))
    .limit(1);

  if (userStats.length === 0) {
    throw new Error("User stats not found");
  }

  const totalBalance =
    parseFloat(userStats[0].totalEarned) +
    parseFloat(userStats[0].referralEarnings);

  if (totalBalance < parseFloat(minerConfig.cost)) {
    throw new Error("Insufficient balance to purchase miner");
  }

  // Create miner record
  await db.insert(miners).values({
    dogeAddress,
    minerType,
    cost: minerConfig.cost,
    incomePerHour: minerConfig.incomePerHour,
    totalIncome: "0",
    lastCollectedAt: new Date(),
    isActive: 1,
  });

  // Deduct cost from user balance
  const newTotalEarned = (totalBalance - parseFloat(minerConfig.cost)).toString();
  await db
    .update(faucetUserStats)
    .set({ totalEarned: newTotalEarned })
    .where(eq(faucetUserStats.dogeAddress, dogeAddress));

  return {
    success: true,
    message: `Successfully purchased ${minerConfig.name}!`,
  };
}

/**
 * Get all miners for a user
 */
export async function getUserMiners(dogeAddress: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const userMiners = await db
    .select()
    .from(miners)
    .where(and(eq(miners.dogeAddress, dogeAddress), eq(miners.isActive, 1)));

  return userMiners;
}

/**
 * Calculate pending income for a miner
 */
export function calculatePendingIncome(
  lastCollectedAt: Date,
  incomePerHour: string
): string {
  const now = new Date();
  const hoursPassed = (now.getTime() - lastCollectedAt.getTime()) / (1000 * 60 * 60);
  const income = hoursPassed * parseFloat(incomePerHour);
  return Math.max(0, income).toFixed(8);
}

/**
 * Collect income from all user miners
 */
export async function collectMinerIncome(dogeAddress: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const userMiners = await getUserMiners(dogeAddress);
  let totalIncome = 0;

  for (const miner of userMiners) {
    const pending = calculatePendingIncome(
      miner.lastCollectedAt,
      miner.incomePerHour
    );
    totalIncome += parseFloat(pending);

    // Update miner's total income and last collected time
    await db
      .update(miners)
      .set({
        totalIncome: (parseFloat(miner.totalIncome) + parseFloat(pending)).toString(),
        lastCollectedAt: new Date(),
      })
      .where(eq(miners.id, miner.id));
  }

  // Add income to user's total earned
  if (totalIncome > 0) {
    const userStats = await db
      .select()
      .from(faucetUserStats)
      .where(eq(faucetUserStats.dogeAddress, dogeAddress))
      .limit(1);

    if (userStats.length > 0) {
      const newTotal = (
        parseFloat(userStats[0].totalEarned) + totalIncome
      ).toString();
      await db
        .update(faucetUserStats)
        .set({ totalEarned: newTotal })
        .where(eq(faucetUserStats.dogeAddress, dogeAddress));
    }
  }

  return {
    success: true,
    totalIncome: totalIncome.toFixed(8),
    minersCount: userMiners.length,
  };
}

/**
 * Get total passive income per hour for a user
 */
export async function getTotalPassiveIncomePerHour(dogeAddress: string): Promise<string> {
  const userMiners = await getUserMiners(dogeAddress);
  let totalPerHour = 0;

  for (const miner of userMiners) {
    totalPerHour += parseFloat(miner.incomePerHour);
  }

  return totalPerHour.toFixed(8);
}
