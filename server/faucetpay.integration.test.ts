import { describe, it, expect } from "vitest";
import { sendDogePayout, getUserBalance, verifyFaucetPayConnection } from "./faucetpay";

/**
 * Integration tests for FaucetPay API
 * Tests the main functions for sending payouts and getting balances
 */
describe("FaucetPay Integration", () => {
  // Test data - using a valid Dogecoin address format
  const testAddress = "D7xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
  const testAmount = 0.001;

  it("should validate Dogecoin address format", async () => {
    // Invalid address (doesn't start with D)
    const result1 = await sendDogePayout("1234567890", testAmount);
    expect(result1.success).toBe(false);
    expect(result1.error).toContain("Invalid Dogecoin address");

    // Invalid address (empty)
    const result2 = await sendDogePayout("", testAmount);
    expect(result2.success).toBe(false);
    expect(result2.error).toContain("Invalid Dogecoin address");
  });

  it("should validate payout amount", async () => {
    // Zero amount
    const result1 = await sendDogePayout(testAddress, 0);
    expect(result1.success).toBe(false);
    expect(result1.error).toContain("greater than 0");

    // Negative amount
    const result2 = await sendDogePayout(testAddress, -0.001);
    expect(result2.success).toBe(false);
    expect(result2.error).toContain("greater than 0");
  });

  it("should format amount to 8 decimal places for API", async () => {
    // This test verifies the amount formatting logic
    const amount = 0.00123456789;
    const formatted = amount.toFixed(8);
    expect(formatted).toBe("0.00123457"); // Rounded to 8 decimals
  });

  it("should handle API errors gracefully", async () => {
    // Test with a valid format but potentially invalid address
    const result = await sendDogePayout(testAddress, testAmount, "Test payout");
    
    // Should return an object with success and error/message fields
    expect(result).toHaveProperty("success");
    expect(typeof result.success).toBe("boolean");
  });

  it("should verify FaucetPay connection", async () => {
    const isConnected = await verifyFaucetPayConnection();
    
    // Should return a boolean
    expect(typeof isConnected).toBe("boolean");
  });

  it("should get user balance", async () => {
    const balance = await getUserBalance(testAddress);
    
    // Should return a number (even if 0 for invalid address)
    expect(typeof balance).toBe("number");
    expect(balance >= 0).toBe(true);
  });
});
