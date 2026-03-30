import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { loadMultiplePopunders } from "@/lib/popunder";
import { trpc } from "@/lib/trpc";

export default function Referrals() {
  const [, navigate] = useLocation();
  const [referralCode, setReferralCode] = useState("DOGE1234");
  const [referralLink, setReferralLink] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState("0.0000");
  const [recentReferrals, setRecentReferrals] = useState<any[]>([]);
  const [userAddress, setUserAddress] = useState("");

  const { data: referralData } = trpc.stats.referrals.useQuery(
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
    if (referralData?.success && referralData.data) {
      setReferralCode(referralData.data.referralCode);
      setReferralCount(referralData.data.referralCount);
      setReferralEarnings(referralData.data.referralEarnings);
      setRecentReferrals(referralData.data.recentReferrals || []);
    }
  }, [referralData]);

  useEffect(() => {
    const link = `${window.location.origin}/?ref=${referralCode}`;
    setReferralLink(link);
  }, [referralCode]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const formatAddress = (addr: string) => addr.slice(0, 6) + "..." + addr.slice(-4);

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
          🎁 My Referrals
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border-2 border-amber-300 p-6 shadow-lg"
          >
            <div className="text-sm text-amber-700 font-bold mb-2">Total Referrals</div>
            <div className="text-4xl font-bold text-amber-600">{referralCount}</div>
            <div className="text-xs text-amber-600 mt-2">Users invited</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg border-2 border-orange-300 p-6 shadow-lg"
          >
            <div className="text-sm text-orange-700 font-bold mb-2">Referral Earnings</div>
            <div className="text-4xl font-bold text-orange-600">{referralEarnings} Ð</div>
            <div className="text-xs text-orange-600 mt-2">Total earned</div>
          </motion.div>
        </div>

        {/* Referral Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border-2 border-amber-300 p-6 shadow-lg mb-8"
        >
          <h2 className="text-xl font-bold text-amber-800 mb-4">Your Referral Code</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={referralCode}
              readOnly
              className="flex-1 px-4 py-2 bg-amber-50 border border-amber-300 rounded-lg font-mono text-sm"
            />
            <button
              onClick={() => copyToClipboard(referralCode, "Referral Code")}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-bold"
            >
              Copy Code
            </button>
          </div>

          <h2 className="text-xl font-bold text-amber-800 mb-4">Your Referral Link</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-4 py-2 bg-amber-50 border border-amber-300 rounded-lg font-mono text-xs"
            />
            <button
              onClick={() => copyToClipboard(referralLink, "Referral Link")}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-bold"
            >
              Copy Link
            </button>
          </div>
        </motion.div>

        {/* Recent Referrals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border-2 border-amber-300 p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-amber-800 mb-4">Recent Referrals</h2>
          {recentReferrals.length > 0 ? (
            <div className="space-y-2">
              {recentReferrals.map((ref, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                  <span className="font-mono text-sm">{formatAddress(ref.address)}</span>
                  <span className="text-xs text-amber-600">{ref.earnedAt}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-amber-600 py-8">No referrals yet. Share your link!</div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
