import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { sendDogePayout, verifyFaucetPayConnection } from "./faucetpay";
import { getLeaderboard, getUserReferralStats, getOrCreateUserStats } from "./faucet-helpers";
import { purchaseMiner, getUserMiners, collectMinerIncome, getTotalPassiveIncomePerHour, MINER_TYPES } from "./miners-helpers";
import { startMiningSession, getMiningStatus, claimMiningRewards, upgradeMiner } from "./mining-dashboard";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  faucet: router({
    claim: publicProcedure
      .input(z.object({ address: z.string().startsWith("D").length(34) }))
      .mutation(async ({ input }) => {
        try {
          const amountNum = Math.random() * (0.0023 - 0.0021) + 0.0021;
          const amount = amountNum.toFixed(8);
          const result = await sendDogePayout(input.address, parseFloat(amount));
          return {
            success: result.success,
            amount,
            message: result.success ? `Claimed ${amount} DOGE!` : "Claim failed",
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message || "Failed to claim",
            amount: "0",
          };
        }
      }),

    completeTask: publicProcedure
      .input(z.object({ address: z.string().startsWith("D").length(34), taskType: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const rewards: Record<string, string> = {
            watch: "0.000104",
            visit: "0.000103",
            survey: "0.000102",
          };
          const amount = rewards[input.taskType] || "0.0001";
          const result = await sendDogePayout(input.address, parseFloat(amount));
          return {
            success: result.success,
            amount,
            message: result.success ? `Earned ${amount} DOGE!` : "Task failed",
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message || "Failed to complete task",
            amount: "0",
          };
        }
      }),

    withdraw: publicProcedure
      .input(z.object({ address: z.string().startsWith("D").length(34), amount: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const result = await sendDogePayout(input.address, parseFloat(input.amount));
          return {
            success: result.success,
            message: result.success ? "Withdrawal pending" : "Withdrawal failed",
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message || "Failed to withdraw",
          };
        }
      }),

    status: publicProcedure
      .input(z.object({ address: z.string().startsWith("D").length(34) }))
      .query(async ({ input }) => {
        try {
          const stats = await getOrCreateUserStats(input.address);
          return {
            success: true,
            data: stats,
          };
        } catch (error) {
          return {
            success: false,
            error: "Failed to fetch status",
            data: null,
          };
        }
      }),
  }),

  stats: router({
    leaderboard: publicProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        try {
          const leaderboard = await getLeaderboard(input.limit);
          return {
            success: true,
            data: leaderboard,
          };
        } catch (error) {
          return {
            success: false,
            error: "Failed to fetch leaderboard",
            data: [],
          };
        }
      }),

    userStats: publicProcedure
      .input(z.object({ address: z.string().startsWith("D").length(34) }))
      .query(async ({ input }) => {
        try {
          const stats = await getOrCreateUserStats(input.address);
          return {
            success: true,
            data: stats,
          };
        } catch (error) {
          return {
            success: false,
            error: "Failed to fetch user stats",
            data: null,
          };
        }
      }),

    referrals: publicProcedure
      .input(z.object({ address: z.string().startsWith("D").length(34) }))
      .query(async ({ input }) => {
        try {
          const referrals = await getUserReferralStats(input.address);
          return {
            success: true,
            data: referrals,
          };
        } catch (error) {
          return {
            success: false,
            error: "Failed to fetch referrals",
            data: null,
          };
        }
      }),
  }),

  miners: router({
    // Get available miner types
    getTypes: publicProcedure.query(async () => {
      return {
        success: true,
        data: Object.entries(MINER_TYPES).map(([key, value]) => ({
          type: key,
          ...value,
        })),
      };
    }),

    // Purchase a miner
    purchase: publicProcedure
      .input(z.object({ address: z.string().startsWith("D").length(34), minerType: z.enum(["basic", "standard", "premium", "elite"]) }))
      .mutation(async ({ input }) => {
        try {
          const result = await purchaseMiner(input.address, input.minerType as any);
          return result;
        } catch (error: any) {
          return {
            success: false,
            error: error.message || "Failed to purchase miner",
          };
        }
      }),

    // Get user's miners
    getUserMiners: publicProcedure
      .input(z.object({ address: z.string().startsWith("D").length(34) }))
      .query(async ({ input }) => {
        try {
          const userMiners = await getUserMiners(input.address);
          return {
            success: true,
            data: userMiners,
          };
        } catch (error) {
          return {
            success: false,
            error: "Failed to fetch miners",
            data: [],
          };
        }
      }),

    // Collect income from miners
    collectIncome: publicProcedure
      .input(z.object({ address: z.string().startsWith("D").length(34) }))
      .mutation(async ({ input }) => {
        try {
          const result = await collectMinerIncome(input.address);
          return {
            success: true,
            totalIncome: result.totalIncome,
            minersCount: result.minersCount,
            message: `Collected ${result.totalIncome} DOGE from ${result.minersCount} miners!`,
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message || "Failed to collect income",
          };
        }
      }),

    // Get total passive income per hour
    getPassiveIncomePerHour: publicProcedure
      .input(z.object({ address: z.string().startsWith("D").length(34) }))
      .query(async ({ input }) => {
        try {
          const incomePerHour = await getTotalPassiveIncomePerHour(input.address);
          return {
            success: true,
            incomePerHour,
          };
        } catch (error) {
          return {
            success: false,
            error: "Failed to calculate income",
            incomePerHour: "0",
          };
        }
      }),
  }),

  mining: router({
    // Start a mining session
    startSession: publicProcedure
      .input(z.object({ address: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const result = await startMiningSession(input.address);
          return result;
        } catch (error: any) {
          return {
            success: false,
            error: error.message || "Failed to start mining session",
          };
        }
      }),

    // Get mining status
    getStatus: publicProcedure
      .input(z.object({ address: z.string() }))
      .query(async ({ input }) => {
        try {
          const status = await getMiningStatus(input.address);
          return { success: true, data: status };
        } catch (error) {
          return {
            success: false,
            error: "Failed to fetch mining status",
            data: null,
          };
        }
      }),

    // Claim mining rewards
    claimRewards: publicProcedure
      .input(z.object({ address: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const result = await claimMiningRewards(input.address);
          return result;
        } catch (error: any) {
          return {
            success: false,
            error: error.message || "Failed to claim rewards",
          };
        }
      }),

    // Upgrade miner
    upgradeMiner: publicProcedure
      .input(z.object({
        address: z.string(),
        minerId: z.number(),
        fromTier: z.enum(["basic", "standard", "premium", "elite"]),
        toTier: z.enum(["basic", "standard", "premium", "elite"]),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await upgradeMiner(input.address, input.minerId, input.fromTier as any, input.toTier as any);
          return result;
        } catch (error: any) {
          return {
            success: false,
            error: error.message || "Failed to upgrade miner",
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
