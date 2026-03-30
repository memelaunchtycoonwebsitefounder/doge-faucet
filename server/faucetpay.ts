import { ENV } from "./_core/env";

const FAUCETPAY_API_URL = "https://faucetpay.io/api/v1";

export interface SendPayoutRequest {
  user_id: string; // Dogecoin address
  amount: number; // Amount in DOGE
  description?: string;
}

export interface SendPayoutResponse {
  success: boolean;
  transaction_id?: string;
  error?: string;
  message?: string;
}

/**
 * Send DOGE payout to a user's wallet via FaucetPay API
 * @param userId - User's Dogecoin address
 * @param amount - Amount in DOGE to send
 * @param description - Optional description of the payout
 * @returns Response with transaction ID or error
 */
export async function sendDogePayout(
  userId: string,
  amount: number,
  description: string = "Doge Faucet Reward"
): Promise<SendPayoutResponse> {
  if (!ENV.faucetpayApiKey) {
    return {
      success: false,
      error: "FaucetPay API key not configured",
    };
  }

  if (amount <= 0) {
    return {
      success: false,
      error: "Amount must be greater than 0",
    };
  }

  if (!userId || !userId.startsWith("D")) {
    return {
      success: false,
      error: "Invalid Dogecoin address",
    };
  }

  try {
    const response = await fetch(`${FAUCETPAY_API_URL}/send`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ENV.faucetpayApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        amount: amount.toFixed(8), // FaucetPay expects 8 decimal places
        description: description,
      }),
    });

    const data = await response.json() as Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false,
        error: (data.error as string) || "Failed to send payout",
      };
    }

    return {
      success: true,
      transaction_id: data.transaction_id as string,
      message: data.message as string,
    };
  } catch (error) {
    console.error("[FaucetPay] Error sending payout:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get user balance from FaucetPay
 * @param userId - User's Dogecoin address
 * @returns User's balance in DOGE
 */
export async function getUserBalance(userId: string): Promise<number> {
  if (!ENV.faucetpayApiKey) {
    console.error("[FaucetPay] API key not configured");
    return 0;
  }

  try {
    const response = await fetch(`${FAUCETPAY_API_URL}/user/balance?user_id=${userId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${ENV.faucetpayApiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("[FaucetPay] Failed to get balance:", response.statusText);
      return 0;
    }

    const data = await response.json() as Record<string, unknown>;
    return parseFloat(data.balance as string) || 0;
  } catch (error) {
    console.error("[FaucetPay] Error getting balance:", error);
    return 0;
  }
}

/**
 * Verify FaucetPay API connectivity
 * @returns true if API is reachable and key is valid
 */
export async function verifyFaucetPayConnection(): Promise<boolean> {
  if (!ENV.faucetpayApiKey) {
    console.error("[FaucetPay] API key not configured");
    return false;
  }

  try {
    const response = await fetch(`${FAUCETPAY_API_URL}/status`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${ENV.faucetpayApiKey}`,
        "Content-Type": "application/json",
      },
    });

    return response.ok;
  } catch (error) {
    console.error("[FaucetPay] Connection verification failed:", error);
    return false;
  }
}
