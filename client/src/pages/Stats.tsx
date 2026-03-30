import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { loadMultiplePopunders } from "@/lib/popunder";
import { trpc } from "@/lib/trpc";

export default function Stats() {
  const [, navigate] = useLocation();
  const [stats, setStats] = useState({
    totalEarned: "0.0000",
    referralEarnings: "0.0000",
    currentStreak: 0,
    maxStreak: 0,
    totalClaims: 0,
    tasksCompleted: 0,
  });
  const [userAddress, setUserAddress] = useState("");

  const { data: statsData } = trpc.stats.userStats.useQuery(
    { address: userAddress },
    { enabled: !!userAddress }
  );

  useEffect(() => {
    loadMultiplePopunders(2, 5000);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("doge_address");
    if (saved) setUserAddress(saved);
  }, []);

  useEffect(() => {
    if (statsData?.success && statsData.data) {
      setStats({
        totalEarned: statsData.data.totalEarned,
        referralEarnings: statsData.data.referralEarnings,
        currentStreak: statsData.data.currentStreak,
        maxStreak: statsData.data.maxStreak,
        totalClaims: Math.floor(parseFloat(statsData.data.totalEarned) / 0.0022),
        tasksCompleted: Math.floor(parseFloat(statsData.data.totalEarned) / 0.0001),
      });
    }
  }, [statsData]);

  const getStreakMultiplier = (streak: number) => {
    if (streak >= 30) return "2.0x";
    if (streak >= 7) return "1.5x";
    return "1.0x";
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://pl29014556.profitablecpmratenetwork.com/0ee654d9e26c67d753bcd60504761f2b/invoke.js';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    document.body.appendChild(script);
  }, []);

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
          onClick={() => navigate("/referrals")}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
        >
          My Referrals
        </button>
      </div>

      {/* Native Banner Ad */}
      <div className="container mb-6">
        <div className="bg-white rounded-lg border-2 border-amber-300 p-4 shadow-lg">
          <div id="container-0ee654d9e26c67d753bcd60504761f2b"></div>
        </div>
      </div>

      <div className="container">
        <h1
          className="text-4xl text-amber-800 text-center mb-8"
          style={{ fontFamily: "'Fredoka One', cursive" }}
        >
          📊 My Statistics
        </h1>

        {/* Earnings Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border-2 border-amber-300 p-6 shadow-lg mb-8"
        >
          <h2 className="text-2xl font-bold text-amber-800 mb-4">💰 Total Earnings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="text-sm text-amber-700 font-bold">From Claims</div>
              <div className="text-3xl font-bold text-amber-600">{stats.totalEarned} Ð</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-orange-700 font-bold">From Referrals</div>
              <div className="text-3xl font-bold text-orange-600">{stats.referralEarnings} Ð</div>
            </div>
          </div>
        </motion.div>

        {/* Streak Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border-2 border-blue-300 p-6 shadow-lg mb-8"
        >
          <h2 className="text-2xl font-bold text-blue-800 mb-4">🔥 Streak Bonuses</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-700 font-bold">Current Streak</div>
              <div className="text-3xl font-bold text-blue-600">{stats.currentStreak} days</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-700 font-bold">Best Streak</div>
              <div className="text-3xl font-bold text-purple-600">{stats.maxStreak} days</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-lg">
            <div className="text-sm font-bold text-blue-800 mb-2">Current Multiplier</div>
            <div className="text-2xl font-bold text-blue-700">{getStreakMultiplier(stats.currentStreak)}</div>
            <div className="text-xs text-blue-600 mt-2">
              {stats.currentStreak >= 30
                ? "🎉 Maximum multiplier unlocked!"
                : stats.currentStreak >= 7
                ? "✨ Keep claiming to reach 30 days for 2x multiplier!"
                : "📈 Claim 7 days in a row for 1.5x multiplier!"}
            </div>
          </div>
        </motion.div>

        {/* Activity Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border-2 border-green-300 p-6 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-green-800 mb-4">📈 Activity Summary</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-bold text-green-800">Total Claims</span>
                <span className="font-bold text-green-600">{stats.totalClaims}</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((stats.totalClaims / 100) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-bold text-green-800">Tasks Completed</span>
                <span className="font-bold text-green-600">{stats.tasksCompleted}</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((stats.tasksCompleted / 200) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
