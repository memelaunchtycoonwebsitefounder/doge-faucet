import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { loadMultiplePopunders } from "@/lib/popunder";

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

  useEffect(() => {
    // Load pop-unders on page visit
    loadMultiplePopunders(2, 5000);

    // Simulate user stats
    setStats({
      totalEarned: "1.2345",
      referralEarnings: "0.0804",
      currentStreak: 15,
      maxStreak: 28,
      totalClaims: 45,
      tasksCompleted: 87,
    });
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
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-lg border-2 border-amber-300 p-6 shadow-lg text-center">
            <p className="text-amber-700 text-sm font-bold mb-2">Total Earned</p>
            <p className="text-4xl font-bold text-amber-800">{stats.totalEarned}</p>
            <p className="text-amber-600 text-sm mt-2">Ð from claims</p>
          </div>
          <div className="bg-white rounded-lg border-2 border-orange-300 p-6 shadow-lg text-center">
            <p className="text-orange-700 text-sm font-bold mb-2">Referral Earnings</p>
            <p className="text-4xl font-bold text-orange-800">{stats.referralEarnings}</p>
            <p className="text-orange-600 text-sm mt-2">Ð from referrals</p>
          </div>
          <div className="bg-white rounded-lg border-2 border-yellow-300 p-6 shadow-lg text-center">
            <p className="text-yellow-700 text-sm font-bold mb-2">Total Balance</p>
            <p className="text-4xl font-bold text-yellow-800">
              {(parseFloat(stats.totalEarned) + parseFloat(stats.referralEarnings)).toFixed(4)}
            </p>
            <p className="text-yellow-600 text-sm mt-2">Ð total</p>
          </div>
        </motion.div>

        {/* Streak Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300 p-6 shadow-lg">
            <h3 className="text-2xl font-bold text-blue-800 mb-4">🔥 Current Streak</h3>
            <p className="text-5xl font-bold text-blue-600 mb-2">{stats.currentStreak}</p>
            <p className="text-blue-700">consecutive days</p>
            <div className="mt-4 p-3 bg-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                {stats.currentStreak >= 7 && stats.currentStreak < 30
                  ? "🎉 You're getting 1.5x multiplier!"
                  : stats.currentStreak >= 30
                  ? "🏆 You're getting 2x multiplier!"
                  : "Keep claiming to build your streak!"}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-300 p-6 shadow-lg">
            <h3 className="text-2xl font-bold text-purple-800 mb-4">⭐ Best Streak</h3>
            <p className="text-5xl font-bold text-purple-600 mb-2">{stats.maxStreak}</p>
            <p className="text-purple-700">days (personal record)</p>
            <div className="mt-4 p-3 bg-purple-200 rounded-lg">
              <p className="text-sm text-purple-900">Keep it up! You can beat your record!</p>
            </div>
          </div>
        </motion.div>

        {/* Activity Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border-2 border-amber-300 p-6 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-amber-800 mb-6">📈 Activity Summary</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-amber-700 font-bold mb-2">Total Claims</p>
              <p className="text-3xl font-bold text-amber-800">{stats.totalClaims}</p>
              <p className="text-sm text-amber-600 mt-2">times claimed DOGE</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-orange-700 font-bold mb-2">Tasks Completed</p>
              <p className="text-3xl font-bold text-orange-800">{stats.tasksCompleted}</p>
              <p className="text-sm text-orange-600 mt-2">ads watched & surveys done</p>
            </div>
          </div>

          {/* Progress to Milestones */}
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg border-2 border-amber-300">
            <h3 className="font-bold text-amber-800 mb-4">🎯 Milestones</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-bold text-amber-700">Total Earned: 2 DOGE</span>
                  <span className="text-sm text-amber-600">
                    {((parseFloat(stats.totalEarned) / 2) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((parseFloat(stats.totalEarned) / 2) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-bold text-orange-700">30-Day Streak</span>
                  <span className="text-sm text-orange-600">{((stats.currentStreak / 30) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((stats.currentStreak / 30) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
