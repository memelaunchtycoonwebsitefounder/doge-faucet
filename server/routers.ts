import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { sendDogePayout, verifyFaucetPayConnection } from "./faucetpay";
import { getLeaderboard, getUserReferralStats, getOrCreateUserStats } from "./faucet-helpers";
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

  // Faucet operations with FaucetPay integration
  faucet: router({
    // Claim DOGE - sends payout via FaucetPay
    claim: publicProcedure
      .input(z.object({
        address: z.string().startsWith("D").length(34, "Invalid Dogecoin address"),
        amount: z.number().min(0.0021).max(0.0023),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await sendDogePayout(
            input.address,
            input.amount,
            "Doge Faucet Claim Reward"
          );

          if (!result.success) {
            return {
              success: false,
              error: result.error || "Failed to process claim",
              transactionId: null,
            };
          }

          return {
            success: true,
            amount: input.amount,
            transactionId: result.transaction_id,
            message: `Successfully claimed ${input.amount} DOGE!`,
          };
        } catch (error) {
          console.error("[Claim] Error:", error);
          return {
            success: false,
            error: "Internal server error",
            transactionId: null,
          };
        }
      }),

    // Complete task - sends task reward via FaucetPay
    completeTask: publicProcedure
      .input(z.object({
        address: z.string().startsWith("D").length(34, "Invalid Dogecoin address"),
        taskId: z.enum(["watch-ad", "visit-site", "survey", "extra-reward"]),
        amount: z.number().min(0.000102).max(0.001499),
      }))
      .mutation(async ({ input }) => {
        const taskNames: Record<string, string> = {
          "watch-ad": "Watch Ad Task",
          "visit-site": "Visit Website Task",
          "survey": "Survey Task",
          "extra-reward": "Extra Reward",
        };

        try {
          const result = await sendDogePayout(
            input.address,
            input.amount,
            `Doge Faucet - ${taskNames[input.taskId]}`
          );

          if (!result.success) {
            return {
              success: false,
              error: result.error || "Failed to complete task",
              transactionId: null,
            };
          }

          return {
            success: true,
            amount: input.amount,
            transactionId: result.transaction_id,
            message: `Task completed! Earned ${input.amount} DOGE`,
          };
        } catch (error) {
          console.error("[Task] Error:", error);
          return {
            success: false,
            error: "Internal server error",
            transactionId: null,
          };
        }
      }),

    // Withdraw DOGE - sends withdrawal via FaucetPay
    withdraw: publicProcedure
      .input(z.object({
        address: z.string().startsWith("D").length(34, "Invalid Dogecoin address"),
        amount: z.number().min(0.1).max(1.0),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await sendDogePayout(
            input.address,
            input.amount,
            "Doge Faucet Withdrawal"
          );

          if (!result.success) {
            return {
              success: false,
              error: result.error || "Withdrawal failed",
              transactionId: null,
            };
          }

          return {
            success: true,
            amount: input.amount,
            transactionId: result.transaction_id,
            message: `Withdrawal of ${input.amount} DOGE processed!`,
          };
        } catch (error) {
          console.error("[Withdrawal] Error:", error);
          return {
            success: false,
            error: "Internal server error",
            transactionId: null,
          };
        }
      }),

    // Check FaucetPay connection status
    status: publicProcedure.query(async () => {
      const isConnected = await verifyFaucetPayConnection();
      return {
        connected: isConnected,
        message: isConnected ? "FaucetPay connected" : "FaucetPay offline",
      };
    }),
  }),

  stats: router({
    leaderboard: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
      .query(async ({ input }) => {
        try {
          const leaderboard = await getLeaderboard(input?.limit || 50);
          return {
            success: true,
            data: leaderboard.map((user, idx) => ({
              rank: idx + 1,
              address: user.dogeAddress,
              totalEarned: user.totalEarned,
              referralEarnings: user.referralEarnings,
              currentStreak: user.currentStreak,
              maxStreak: user.maxStreak,
            })),
          };
        } catch (error) {
          return { success: false, error: "Failed to fetch leaderboard", data: [] };
        }
      }),

    userStats: publicProcedure
      .input(z.object({ address: z.string().startsWith("D").length(34) }))
      .query(async ({ input }) => {
        try {
          const stats = await getOrCreateUserStats(input.address);
          return {
            success: true,
            data: {
              totalEarned: stats.totalEarned,
              referralEarnings: stats.referralEarnings,
              currentStreak: stats.currentStreak,
              maxStreak: stats.maxStreak,
              referralCount: stats.referralCount,
              referralCode: stats.referralCode,
            },
          };
        } catch (error) {
          return { success: false, error: "Failed to fetch user stats", data: null };
        }
      }),

    referrals: publicProcedure
      .input(z.object({ address: z.string().startsWith("D").length(34) }))
      .query(async ({ input }) => {
        try {
          const referralStats = await getUserReferralStats(input.address);
          return {
            success: true,
            data: referralStats,
          };
        } catch (error) {
          return { success: false, error: "Failed to fetch referral stats", data: null };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
