import { getDb } from "./db";
import { faucetUserStats, referrals } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * Generate a unique referral code
 */
export function generateReferralCode(): string {
  return nanoid(8).toUpperCase();
}

/**
 * Get or create user stats
 */
export async function getOrCreateUserStats(dogeAddress: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(faucetUserStats)
    .where(eq(faucetUserStats.dogeAddress, dogeAddress))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new user stats
  const referralCode = generateReferralCode();
  await db.insert(faucetUserStats).values({
    dogeAddress,
    currentStreak: 0,
    maxStreak: 0,
    totalEarned: "0",
    referralEarnings: "0",
    referralCount: 0,
    referralCode,
  });

  const newStats = await db
    .select()
    .from(faucetUserStats)
    .where(eq(faucetUserStats.dogeAddress, dogeAddress))
    .limit(1);

  return newStats[0];
}

/**
 * Calculate streak bonus multiplier based on current streak
 * Day 7: 1.5x, Day 30: 2x
 */
export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 2.0;
  if (streak >= 7) return 1.5;
  return 1.0;
}

/**
 * Update user streak after a claim
 * Returns true if streak continues, false if streak was reset
 */
export async function updateUserStreak(dogeAddress: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const stats = await getOrCreateUserStats(dogeAddress);
  const now = new Date();
  const lastClaim = stats.lastClaimAt ? new Date(stats.lastClaimAt) : null;

  // Check if last claim was today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (lastClaim) {
    const lastClaimDate = new Date(lastClaim);
    lastClaimDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (today.getTime() - lastClaimDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
      // Already claimed today, don't update streak
      return true;
    } else if (daysDiff === 1) {
      // Claimed yesterday, continue streak
      const newStreak = stats.currentStreak + 1;
      const maxStreak = Math.max(stats.maxStreak, newStreak);

      await db
        .update(faucetUserStats)
        .set({
          currentStreak: newStreak,
          maxStreak,
          lastClaimAt: now,
        })
        .where(eq(faucetUserStats.dogeAddress, dogeAddress));

      return true;
    } else {
      // Streak broken, reset to 1
      await db
        .update(faucetUserStats)
        .set({
          currentStreak: 1,
          lastClaimAt: now,
        })
        .where(eq(faucetUserStats.dogeAddress, dogeAddress));

      return false;
    }
  } else {
    // First claim
    await db
      .update(faucetUserStats)
      .set({
        currentStreak: 1,
        maxStreak: 1,
        lastClaimAt: now,
      })
      .where(eq(faucetUserStats.dogeAddress, dogeAddress));

    return true;
  }
}

/**
 * Process referral - add referral record and update stats
 */
export async function processReferral(
  referrerCode: string,
  referredAddress: string
): Promise<{ success: boolean; error?: string; referrerAddress?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Find referrer by code
  const referrer = await db
    .select()
    .from(faucetUserStats)
    .where(eq(faucetUserStats.referralCode, referrerCode))
    .limit(1);

  if (!referrer || referrer.length === 0) {
    return { success: false, error: "Invalid referral code" };
  }

  const referrerAddress = referrer[0].dogeAddress;

  // Check if referred user already exists
  const existingUser = await db
    .select()
    .from(faucetUserStats)
    .where(eq(faucetUserStats.dogeAddress, referredAddress))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: false, error: "User already registered" };
  }

  // Create referral record
  await db.insert(referrals).values({
    referrerAddress,
    referredAddress,
    rewardAmount: "0.0067",
    isPaid: 0,
  });

  // Update referrer stats
  const newReferralCount = referrer[0].referralCount + 1;
  const currentEarnings = parseFloat(referrer[0].referralEarnings);
  const newEarnings = (currentEarnings + 0.0067).toFixed(8);

  await db
    .update(faucetUserStats)
    .set({
      referralCount: newReferralCount,
      referralEarnings: newEarnings,
    })
    .where(eq(faucetUserStats.dogeAddress, referrerAddress));

  return { success: true, referrerAddress };
}

/**
 * Get user referral stats
 */
export async function getUserReferralStats(dogeAddress: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const stats = await getOrCreateUserStats(dogeAddress);

  // Get recent referrals
  const recentReferrals = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referrerAddress, dogeAddress))
    .limit(10);

  return {
    referralCode: stats.referralCode,
    referralCount: stats.referralCount,
    referralEarnings: stats.referralEarnings,
    recentReferrals,
  };
}

/**
 * Get leaderboard (top earners)
 */
export async function getLeaderboard(limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const topEarners = await db
    .select()
    .from(faucetUserStats)
    .limit(limit);

  return topEarners
    .map((user) => ({
      dogeAddress: user.dogeAddress,
      totalEarned: user.totalEarned,
      referralEarnings: user.referralEarnings,
      currentStreak: user.currentStreak,
      maxStreak: user.maxStreak,
      referralCount: user.referralCount,
    }))
    .sort(
      (a, b) =>
        parseFloat(b.totalEarned) +
        parseFloat(b.referralEarnings) -
        (parseFloat(a.totalEarned) + parseFloat(a.referralEarnings))
    );
}
