import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function MiningDashboard() {
  const [, navigate] = useLocation();
  const [walletAddress, setWalletAddress] = useState("");
  const [miningBalance, setMiningBalance] = useState("0.00000000");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch mining status
  const statusQuery = trpc.mining.getStatus.useQuery(
    { address: walletAddress },
    { enabled: !!walletAddress, refetchInterval: 5000 }
  );

  // Start session mutation
  const startSessionMutation = trpc.mining.startSession.useMutation({
    onSuccess: (data: any) => {
      if (data.success) {
        toast.success(data.message || 'Mining session started');
        statusQuery.refetch();
      } else {
        toast.error(data.error || 'Failed to start mining');
      }
    },
  });

  // Claim rewards mutation
  const claimRewardsMutation = trpc.mining.claimRewards.useMutation({
    onSuccess: (data: any) => {
      if (data.success) {
        toast.success(`🎉 Claimed ${data.amount || 'rewards'} DOGE!`);
        statusQuery.refetch();
      } else {
        toast.error(data.error || 'Failed to claim');
      }
    },
  });

  // Load wallet from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("doge_wallet");
    if (stored) {
      setWalletAddress(stored);
    }
  }, []);

  // Update mining balance and time remaining
  useEffect(() => {
    if (statusQuery.data?.success && statusQuery.data?.data) {
      const status = statusQuery.data.data;
      setMiningBalance(status.currentBalance);
      setIsSessionActive(status.isActive);
      setTimeRemaining(Math.max(0, status.timeRemaining));
    }
  }, [statusQuery.data]);

  // Update countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleStartMining = async () => {
    if (!walletAddress) {
      toast.error("Please connect wallet first");
      return;
    }
    setLoading(true);
    try {
      await startSessionMutation.mutateAsync({ address: walletAddress });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!walletAddress) {
      toast.error("Please connect wallet first");
      return;
    }
    setLoading(true);
    try {
      await claimRewardsMutation.mutateAsync({ address: walletAddress });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-black py-8">
      {/* Navigation */}
      <div className="container mb-6 flex gap-2 justify-center flex-wrap">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-amber-500 text-white rounded-full font-bold hover:bg-amber-600"
        >
          ⛏️ Home
        </button>
        <button
          onClick={() => navigate("/leaderboard")}
          className="px-4 py-2 bg-amber-500 text-white rounded-full font-bold hover:bg-amber-600"
        >
          🏆 Leaderboard
        </button>
        <button
          onClick={() => navigate("/mining-dashboard")}
          className="px-4 py-2 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700"
        >
          ⛏️ Mining
        </button>
      </div>

      <div className="container">
        {/* Title */}
        <h1
          className="text-5xl text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500"
          style={{ fontFamily: "'Fredoka One', cursive" }}
        >
          ⛏️ Professional Mining Dashboard
        </h1>

        {/* Main Mining Display */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 bg-gradient-to-br from-purple-800 to-indigo-900 rounded-3xl border-4 border-yellow-400 p-12 shadow-2xl"
        >
          {/* Large Balance Display */}
          <div className="text-center mb-8">
            <p className="text-purple-200 text-lg mb-4">Current Mining Balance</p>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-2"
            >
              {miningBalance}
            </motion.div>
            <p className="text-yellow-300 text-2xl font-bold">Ð DOGE</p>
          </div>

          {/* Mining Status */}
          {isSessionActive ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/20 border-2 border-green-400 rounded-xl p-6 mb-6"
            >
              <p className="text-green-300 text-center text-lg font-bold mb-2">
                ✅ Mining Active
              </p>
              <p className="text-green-200 text-center text-xl mb-2">
                ⏱️ Time Remaining: {formatTime(timeRemaining)}
              </p>
              <p className="text-green-200 text-center text-sm">
                Mining Rate: +0.00002 Ð per 10 minutes
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border-2 border-red-400 rounded-xl p-6 mb-6"
            >
              <p className="text-red-300 text-center text-lg font-bold">
                ❌ No Active Mining Session
              </p>
              <p className="text-red-200 text-center text-sm mt-2">
                Click "Start Mining" to begin earning passive DOGE
              </p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartMining}
              disabled={loading || isSessionActive}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-4 px-6 rounded-xl disabled:opacity-50 text-lg transition"
            >
              🚀 Start Mining (12 Hours)
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClaimRewards}
              disabled={loading || !isSessionActive || parseFloat(miningBalance) === 0}
              className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-black font-bold py-4 px-6 rounded-xl disabled:opacity-50 text-lg transition"
            >
              💰 Claim Rewards
            </motion.button>
          </div>
        </motion.div>

        {/* Info Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-blue-900/50 border-2 border-blue-400 rounded-xl p-6"
          >
            <h3 className="text-2xl font-bold text-blue-300 mb-4">📖 How It Works</h3>
            <ul className="text-blue-200 space-y-3">
              <li>✅ Click "Start Mining" to activate a 12-hour session</li>
              <li>✅ Earn +0.00002 DOGE every 10 minutes automatically</li>
              <li>✅ Must stay active within 12 hours or mining stops</li>
              <li>✅ Click "Claim Rewards" to add earnings to your balance</li>
              <li>✅ Upgrade miners to increase earning power</li>
            </ul>
          </motion.div>

          {/* Upgrade System */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-purple-900/50 border-2 border-purple-400 rounded-xl p-6"
          >
            <h3 className="text-2xl font-bold text-purple-300 mb-4">⚡ Upgrade System</h3>
            <ul className="text-purple-200 space-y-3">
              <li>🔧 Basic → Standard: 1 DOGE (x3 power)</li>
              <li>🔧 Standard → Premium: 1 DOGE (x3 power)</li>
              <li>🔧 Premium → Elite: 1 DOGE (x3 power)</li>
              <li>💎 Elite miners earn the most DOGE</li>
              <li>🎯 Combine with multiple miners for exponential growth</li>
            </ul>
          </motion.div>
        </div>

        {/* Pro Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-2 border-yellow-400 rounded-xl p-6 mb-8"
        >
          <h3 className="text-2xl font-bold text-yellow-300 mb-4">💡 Pro Tips</h3>
          <ul className="text-yellow-100 space-y-2">
            <li>• Start multiple mining sessions with different wallets for exponential earnings</li>
            <li>• Upgrade your miners to x3 power for faster passive income</li>
            <li>• Claim rewards regularly to reinvest in more miners</li>
            <li>• Keep sessions active by logging in at least once every 12 hours</li>
            <li>• Combine mining with the faucet and referrals for maximum DOGE</li>
          </ul>
        </motion.div>
      </div>

      {/* Pop-under ads */}
      <script async src="https://pl29014555.profitablecpmratenetwork.com/17/8e/40/178e4091eddcb131be13ce883019531d.js"></script>
    </div>
  );
}
