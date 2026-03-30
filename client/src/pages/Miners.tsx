import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Miners() {
  const [, navigate] = useLocation();
  const [walletAddress, setWalletAddress] = useState("");
  const [userMiners, setUserMiners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch miner types
  const minerTypesQuery = trpc.miners.getTypes.useQuery();

  // Fetch user miners
  const getUserMinersQuery = trpc.miners.getUserMiners.useQuery(
    { address: walletAddress },
    { enabled: !!walletAddress }
  );

  // Purchase miner mutation
  const purchaseMutation = trpc.miners.purchase.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        // Refetch miners
        if (walletAddress) {
          getUserMinersQuery.refetch();
        }
      } else {
        toast.error(data.error);
      }
    },
  });

  // Collect income mutation
  const collectIncomeMutation = trpc.miners.collectIncome.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        if (walletAddress) {
          getUserMinersQuery.refetch();
        }
      } else {
        toast.error(data.error);
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

  // Update user miners when query data changes
  useEffect(() => {
    if (getUserMinersQuery.data?.success && getUserMinersQuery.data?.data) {
      setUserMiners(getUserMinersQuery.data.data);
    }
  }, [getUserMinersQuery.data]);

  const handlePurchase = async (minerType: string) => {
    if (!walletAddress) {
      toast.error("Please connect wallet first");
      return;
    }
    setLoading(true);
    try {
      await purchaseMutation.mutateAsync({
        address: walletAddress,
        minerType: minerType as any,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCollectIncome = async () => {
    if (!walletAddress) {
      toast.error("Please connect wallet first");
      return;
    }
    setLoading(true);
    try {
      await collectIncomeMutation.mutateAsync({ address: walletAddress });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 py-8">
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
          onClick={() => navigate("/referrals")}
          className="px-4 py-2 bg-amber-500 text-white rounded-full font-bold hover:bg-amber-600"
        >
          🎁 Referrals
        </button>
        <button
          onClick={() => navigate("/stats")}
          className="px-4 py-2 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600"
        >
          📊 Stats
        </button>
        <button
          onClick={() => navigate("/miners")}
          className="px-4 py-2 bg-purple-500 text-white rounded-full font-bold hover:bg-purple-600"
        >
          ⛏️ Miners
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
          ⛏️ Virtual Miners Shop
        </h1>

        {/* User Miners Section */}
        {userMiners.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white rounded-lg border-2 border-green-300 p-6 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-green-700 mb-4">Your Miners ({userMiners.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {userMiners.map((miner) => (
                <div key={miner.id} className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
                  <p className="font-bold text-green-700">{miner.minerType.toUpperCase()} Miner</p>
                  <p className="text-sm text-gray-600">Income/Hour: {miner.incomePerHour} Ð</p>
                  <p className="text-sm text-gray-600">Total Earned: {miner.totalIncome} Ð</p>
                </div>
              ))}
            </div>
            <button
              onClick={handleCollectIncome}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50"
            >
              💰 Collect Income Now
            </button>
          </motion.div>
        )}

        {/* Available Miners */}
        <h2 className="text-2xl font-bold text-amber-800 mb-6">Available Miners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {minerTypesQuery.data?.data?.map((miner: any) => (
            <motion.div
              key={miner.type}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg border-4 border-amber-400 p-6 shadow-lg hover:shadow-xl transition"
            >
              <h3 className="text-2xl font-bold text-amber-800 mb-2">{miner.name}</h3>
              <p className="text-gray-600 mb-4">{miner.description}</p>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg mb-4">
                <p className="text-lg font-bold text-orange-700">
                  💰 Cost: {miner.cost} Ð
                </p>
                <p className="text-lg font-bold text-green-700">
                  💵 Income: {miner.incomePerHour} Ð/hour
                </p>
              </div>

              <button
                onClick={() => handlePurchase(miner.type)}
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 transition"
              >
                🛒 Buy Now
              </button>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-300 p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-blue-800 mb-4">ℹ️ How Miners Work</h3>
          <ul className="text-gray-700 space-y-2">
            <li>✅ Buy miners with your DOGE balance</li>
            <li>✅ Miners generate passive income every hour</li>
            <li>✅ Collect income anytime to add to your balance</li>
            <li>✅ More miners = More passive income</li>
            <li>✅ Use your passive income to buy more miners!</li>
          </ul>
        </motion.div>
      </div>

      {/* Pop-under ads */}
      <script async src="https://pl29014555.profitablecpmratenetwork.com/17/8e/40/178e4091eddcb131be13ce883019531d.js"></script>
    </div>
  );
}
