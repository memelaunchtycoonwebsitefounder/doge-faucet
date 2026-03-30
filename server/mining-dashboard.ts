import { getDb } from "./db";
import { miningSessions, faucetUserStats, minerUpgrades, miners } from "../drizzle/schema";
import { eq, and, gt } from "drizzle-orm";

const MINING_RATE_PER_10MIN = "0.00002"; // 0.00002 DOGE per 10 minutes
const SESSION_DURATION_HOURS = 12;
const UPGRADE_COST = "1"; // 1 DOGE to upgrade
const POWER_MULTIPLIER = 3; // x3 mining power

/**
 * Start a new mining session for a user
 */
export async function startMiningSession(dogeAddress: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if user has active session
  const activeSession = await db
    .select()
    .from(miningSessions)
    .where(
      and(
        eq(miningSessions.dogeAddress, dogeAddress),
        eq(miningSessions.isActive, 1),
        gt(miningSessions.sessionExpiresAt, new Date())
      )
    )
    .limit(1);

  if (activeSession.length > 0) {
    return {
      success: false,
      error: "You already have an active mining session",
      session: activeSession[0],
    };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

  // Create new session
  await db.insert(miningSessions).values({
    dogeAddress,
    sessionStartAt: now,
    sessionExpiresAt: expiresAt,
    miningRate: MINING_RATE_PER_10MIN,
    totalMined: "0",
    isActive: 1,
  });

  return {
    success: true,
    message: "Mining session started! You have 12 hours to keep it active.",
    expiresAt,
  };
}

/**
 * Get active mining session for a user
 */
export async function getActiveMiningSession(dogeAddress: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const session = await db
    .select()
    .from(miningSessions)
    .where(
      and(
        eq(miningSessions.dogeAddress, dogeAddress),
        eq(miningSessions.isActive, 1),
        gt(miningSessions.sessionExpiresAt, new Date())
      )
    )
    .limit(1);

  if (session.length === 0) {
    return null;
  }

  return session[0];
}

/**
 * Calculate current mining balance based on session
 */
export function calculateMiningBalance(session: any): string {
  if (!session) return "0";

  const now = new Date();
  const sessionStart = new Date(session.sessionStartAt);
  const minutesPassed = (now.getTime() - sessionStart.getTime()) / (1000 * 60);
  const tenMinutePeriods = Math.floor(minutesPassed / 10);

  const miningRate = parseFloat(session.miningRate);
  const totalMined = tenMinutePeriods * miningRate;

  return Math.max(0, totalMined).toFixed(8);
}

/**
 * Claim mining rewards and add to user balance
 */
export async function claimMiningRewards(dogeAddress: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const session = await getActiveMiningSession(dogeAddress);
  if (!session) {
    throw new Error("No active mining session");
  }

  const now = new Date();
  if (now > session.sessionExpiresAt) {
    // Session expired
    await db
      .update(miningSessions)
      .set({ isActive: 0 })
      .where(eq(miningSessions.id, session.id));
    throw new Error("Mining session has expired");
  }

  const miningBalance = calculateMiningBalance(session);
  const amount = parseFloat(miningBalance);

  if (amount <= 0) {
    throw new Error("No mining rewards to claim yet");
  }

  // Add to user balance
  const userStats = await db
    .select()
    .from(faucetUserStats)
    .where(eq(faucetUserStats.dogeAddress, dogeAddress))
    .limit(1);

  if (userStats.length === 0) {
    throw new Error("User stats not found");
  }

  const newTotal = (parseFloat(userStats[0].totalEarned) + amount).toString();
  await db
    .update(faucetUserStats)
    .set({ totalEarned: newTotal })
    .where(eq(faucetUserStats.dogeAddress, dogeAddress));

  // Update session
  await db
    .update(miningSessions)
    .set({
      totalMined: miningBalance,
      sessionStartAt: now, // Reset for next mining period
    })
    .where(eq(miningSessions.id, session.id));

  return {
    success: true,
    amount: miningBalance,
    message: `Claimed ${miningBalance} DOGE!`,
  };
}

/**
 * Upgrade miner to next tier with x3 power multiplier
 */
export async function upgradeMiner(
  dogeAddress: string,
  minerId: number,
  fromTier: string,
  toTier: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

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
    parseFloat(userStats[0].totalEarned) + parseFloat(userStats[0].referralEarnings);

  if (totalBalance < parseFloat(UPGRADE_COST)) {
    throw new Error("Insufficient balance to upgrade miner");
  }

  // Create upgrade record
  await db.insert(minerUpgrades).values({
    dogeAddress,
    minerId,
    fromTier: fromTier as any,
    toTier: toTier as any,
    powerMultiplier: POWER_MULTIPLIER.toString(),
    upgradeCost: UPGRADE_COST,
  });

  // Update miner tier
  const miner = await db.select().from(miners).where(eq(miners.id, minerId)).limit(1);

  if (miner.length > 0) {
    const oldIncomePerHour = parseFloat(miner[0].incomePerHour);
    const newIncomePerHour = (oldIncomePerHour * POWER_MULTIPLIER).toString();

    await db
      .update(miners)
      .set({
        minerType: toTier as any,
        incomePerHour: newIncomePerHour,
      })
      .where(eq(miners.id, minerId));
  }

  // Deduct cost from balance
  const newTotal = (totalBalance - parseFloat(UPGRADE_COST)).toString();
  await db
    .update(faucetUserStats)
    .set({ totalEarned: newTotal })
    .where(eq(faucetUserStats.dogeAddress, dogeAddress));

  return {
    success: true,
    message: `Miner upgraded to ${toTier}! Mining power increased by ${POWER_MULTIPLIER}x!`,
  };
}

/**
 * Get mining session status for dashboard
 */
export async function getMiningStatus(dogeAddress: string) {
  const session = await getActiveMiningSession(dogeAddress);

  if (!session) {
    return {
      isActive: false,
      currentBalance: "0",
      timeRemaining: 0,
      message: "No active mining session",
    };
  }

  const now = new Date();
  const currentBalance = calculateMiningBalance(session);
  const timeRemaining = Math.max(0, session.sessionExpiresAt.getTime() - now.getTime());

  return {
    isActive: true,
    currentBalance,
    timeRemaining,
    sessionExpiresAt: session.sessionExpiresAt,
    miningRate: session.miningRate,
  };
}
