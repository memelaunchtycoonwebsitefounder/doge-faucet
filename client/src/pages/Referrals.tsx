import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { loadMultiplePopunders } from "@/lib/popunder";

export default function Referrals() {
  const [, navigate] = useLocation();
  const [referralCode, setReferralCode] = useState("DOGE1234");
  const [referralLink, setReferralLink] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState("0.0000");
  const [recentReferrals, setRecentReferrals] = useState<any[]>([]);

  useEffect(() => {
    // Load pop-unders on page visit
    loadMultiplePopunders(2, 5000);

    // Generate referral link
    const link = `${window.location.origin}/?ref=${referralCode}`;
    setReferralLink(link);

    // Simulate referral data
    setReferralCount(12);
    setReferralEarnings("0.0804");
    setRecentReferrals([
      { address: "D7a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5", earnedAt: "2 hours ago" },
      { address: "D8b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6", earnedAt: "5 hours ago" },
      { address: "D9c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7", earnedAt: "1 day ago" },
    ]);
  }, [referralCode]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const formatAddress = (addr: string) => addr.slice(0, 6) + "..." + addr.slice(-4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 py-8">
      {/* Navigation */}
      <div className="container mb-6 flex gap-2 justify-center flex-wrap">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
        >
          Home
        </button>
        <button
          onClick={() => navigate("/leaderboard")}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          Leaderboard
        </button>
        <button
          onClick={() => navigate("/stats")}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
        >
          My Stats
        </button>
      </div>

      <div className="container">
        <h1
          className="text-4xl text-amber-800 text-center mb-8"
          style={{ fontFamily: "'Fredoka One', cursive" }}
        >
          🎁 My Referrals
        </h1>

        {/* Referral Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          <div className="bg-white rounded-lg border-2 border-amber-300 p-6 shadow-lg">
            <p className="text-amber-700 text-sm font-bold mb-2">Total Referrals</p>
            <p className="text-4xl font-bold text-amber-800">{referralCount}</p>
            <p className="text-amber-600 text-sm mt-2">users referred</p>
          </div>
          <div className="bg-white rounded-lg border-2 border-orange-300 p-6 shadow-lg">
            <p className="text-orange-700 text-sm font-bold mb-2">Referral Earnings</p>
            <p className="text-4xl font-bold text-orange-800">{referralEarnings} Ð</p>
            <p className="text-orange-600 text-sm mt-2">0.0067 DOGE per referral</p>
          </div>
        </motion.div>

        {/* Referral Code & Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border-2 border-amber-300 p-6 shadow-lg mb-8"
        >
          <h2 className="text-2xl font-bold text-amber-800 mb-4">Share Your Referral Link</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-amber-700 font-bold mb-2">Your Referral Code:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralCode}
                  readOnly
                  className="flex-1 px-4 py-2 bg-amber-50 border-2 border-amber-300 rounded-lg font-mono text-amber-900"
                />
                <button
                  onClick={() => copyToClipboard(referralCode, "Referral code")}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-bold"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm text-amber-700 font-bold mb-2">Your Referral Link:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 px-4 py-2 bg-amber-50 border-2 border-amber-300 rounded-lg font-mono text-sm text-amber-900 overflow-x-auto"
                />
                <button
                  onClick={() => copyToClipboard(referralLink, "Referral link")}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-bold whitespace-nowrap"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>

          <p className="text-sm text-amber-600 mt-4">
            💡 Share this link with friends. When they sign up using your code, you both earn 0.0067 DOGE!
          </p>
        </motion.div>

        {/* Recent Referrals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border-2 border-amber-300 p-6 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-amber-800 mb-4">Recent Referrals</h2>

          {recentReferrals.length > 0 ? (
            <div className="space-y-3">
              {recentReferrals.map((ref, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200"
                >
                  <div>
                    <p className="font-mono text-sm text-amber-900">{formatAddress(ref.address)}</p>
                    <p className="text-xs text-amber-600">{ref.earnedAt}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">+0.0067 Ð</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-amber-600 text-center py-6">No referrals yet. Share your link to get started!</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
