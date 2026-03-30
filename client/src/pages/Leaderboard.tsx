import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { loadMultiplePopunders } from "@/lib/popunder";
import { trpc } from "@/lib/trpc";

export default function Leaderboard() {
  const [, navigate] = useLocation();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: leaderboardData, isLoading } = trpc.stats.leaderboard.useQuery({ limit: 50 });

  useEffect(() => {
    // Load pop-unders on page visit
    loadMultiplePopunders(2, 5000);
  }, []);

  useEffect(() => {
    if (leaderboardData?.success && leaderboardData.data) {
      setLeaderboard(leaderboardData.data);
      setLoading(false);
    } else if (leaderboardData?.success === false) {
      // Fallback to mock data if query fails
      const mockData = [
      {
        rank: 1,
        address: "D7a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5",
        totalEarned: "2.5432",
        referralEarnings: "0.3402",
        currentStreak: 45,
        maxStreak: 45,
      },
      {
        rank: 2,
        address: "D8b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
        totalEarned: "1.8765",
        referralEarnings: "0.2145",
        currentStreak: 32,
        maxStreak: 38,
      },
      {
        rank: 3,
        address: "D9c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7",
        totalEarned: "1.5234",
        referralEarnings: "0.1890",
        currentStreak: 28,
        maxStreak: 30,
      },
      {
        rank: 4,
        address: "D0d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8",
        totalEarned: "1.2456",
        referralEarnings: "0.1234",
        currentStreak: 21,
        maxStreak: 25,
      },
      {
        rank: 5,
        address: "D1e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9",
        totalEarned: "0.9876",
        referralEarnings: "0.0890",
        currentStreak: 15,
        maxStreak: 20,
      },
      ];
      setLeaderboard(mockData);
      setLoading(false);
    }
  }, [leaderboardData]);

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
    }
  }, [isLoading]);

  const formatAddress = (addr: string) => addr.slice(0, 6) + "..." + addr.slice(-4);

  useEffect(() => {
    // Load native banner ad script
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
          onClick={() => navigate("/referrals")}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          My Referrals
        </button>
        <button
          onClick={() => navigate("/stats")}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
        >
          My Stats
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
          🏆 Top Earners Leaderboard
        </h1>

        {loading ? (
          <div className="text-center text-amber-700">Loading leaderboard...</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border-2 border-amber-300 overflow-hidden shadow-lg"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Rank</th>
                    <th className="px-4 py-3 text-left">Address</th>
                    <th className="px-4 py-3 text-right">Total Earned</th>
                    <th className="px-4 py-3 text-right">Referral Earnings</th>
                    <th className="px-4 py-3 text-center">Current Streak</th>
                    <th className="px-4 py-3 text-center">Max Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`border-b-2 border-amber-200 hover:bg-amber-50 transition ${
                        idx === 0 ? "bg-yellow-50" : idx === 1 ? "bg-gray-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="text-2xl font-bold text-amber-700">
                          {user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : user.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">{formatAddress(user.address)}</td>
                      <td className="px-4 py-3 text-right font-bold text-amber-700">{user.totalEarned} Ð</td>
                      <td className="px-4 py-3 text-right font-bold text-orange-600">{user.referralEarnings} Ð</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-bold">
                          {user.currentStreak} days 🔥
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm font-bold">
                          {user.maxStreak} days
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
