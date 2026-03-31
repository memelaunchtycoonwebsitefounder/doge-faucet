/* =============================================================
   TRX FAUCET — Home Page (Full-Stack)
   Design: Warm Brutalism + Crypto Aesthetic
   Colors: Cream (#fef9ec) bg, TRX red primary, earthy orange accent
   Fonts: Fredoka One (display) + Nunito (body)
   Integration: FaucetPay API + Task Rewards + Withdrawals
   ============================================================= */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { loadPopunderOnFirstVisit, loadMultiplePopunders } from "@/lib/popunder";
import Confetti from "@/components/Confetti";

// Load Adsterra banner ads (static, always show)
if (typeof window !== 'undefined') {
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = 'https://pl29014556.profitablecpmratenetwork.com/0ee654d9e26c67d753bcd60504761f2b/invoke.js';
  script1.setAttribute('data-cfasync', 'false');
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.src = 'https://pl29014555.profitablecpmratenetwork.com/17/8e/40/178e4091eddcb131be13ce883019531d.js';
  document.head.appendChild(script2);



  // Banner 468x60 ad
  const bannerScript = document.createElement('script');
  bannerScript.innerHTML = `
    atOptions = {
      'key' : '19cf032afad8f11d35833a2921442c1e',
      'format' : 'iframe',
      'height' : 60,
      'width' : 468,
      'params' : {}
    };
  `;
  document.head.appendChild(bannerScript);

  const bannerInvokeScript = document.createElement('script');
  bannerInvokeScript.src = 'https://www.highperformanceformat.com/19cf032afad8f11d35833a2921442c1e/invoke.js';
  document.head.appendChild(bannerInvokeScript);

  // Adsterra Popunder Ads (Prioritized)
  const adsterraPopunder1 = document.createElement('script');
  adsterraPopunder1.async = true;
  adsterraPopunder1.src = 'https://pl29014556.profitablecpmratenetwork.com/0ee654d9e26c67d753bcd60504761f2b/invoke.js';
  adsterraPopunder1.setAttribute('data-cfasync', 'false');
  document.head.appendChild(adsterraPopunder1);

  const adsterraPopunder2 = document.createElement('script');
  adsterraPopunder2.async = true;
  adsterraPopunder2.src = 'https://pl29014555.profitablecpmratenetwork.com/17/8e/40/178e4091eddcb131be13ce883019531d.js';
  adsterraPopunder2.setAttribute('data-cfasync', 'false');
  document.head.appendChild(adsterraPopunder2);

  // EVADAY Popunder Ads
  const evadayPopunder = document.createElement('script');
  evadayPopunder.async = true;
  evadayPopunder.src = 'https://pufted.com/p/waWQiOjEyMjMyNjQsInNpZCI6MTc0NjYyNSwid2lkIjo3Mzc4NzksInNyYyI6Mn0=eyJ.js';
  document.head.appendChild(evadayPopunder);

  // Popup Push Subscriptions (Telegram Premium)
  const popupPushScript = document.createElement('script');
  popupPushScript.innerHTML = `(function(d,a,b){let s=d.createElement('script');s.async=true;s.src='https://peacyx.com/code/pops.js?h=waWQiOjEyMjMyNjQsInNpZCI6MTc0NjYyNSwid2lkIjo3MzgwNDksInNyYyI6Mn0=eyJ&si1='+a+'&si2='+b;d.head.appendChild(s);})(document,'subid1','subid2');`;
  document.head.appendChild(popupPushScript);

  // NativeAds (First)
  const nativeAds1 = document.createElement('script');
  nativeAds1.async = true;
  nativeAds1.src = 'https://curoax.com/na/waWQiOjEyMjMyNjQsInNpZCI6MTc0NjYyNSwid2lkIjo3Mzc4NzcsInNyYyI6Mn0=eyJ.js';
  document.head.appendChild(nativeAds1);

  // NativeAds (Second)
  const nativeAds2 = document.createElement('script');
  nativeAds2.innerHTML = `(function(d){let s=d.createElement('script');s.async=true;s.src='https://tbwdoo.com/code/native.js?h=waWQiOjEyMjMyNjQsInNpZCI6MTc0NjYyNSwid2lkIjo3Mzc4NzYsInNyYyI6Mn0=eyJ';d.head.appendChild(s);})(document);`;
  document.head.appendChild(nativeAds2);

  // Additional Adsterra Popunder (Third)
  const adsterraPopunder3 = document.createElement('script');
  adsterraPopunder3.async = true;
  adsterraPopunder3.src = 'https://pl29014555.profitablecpmratenetwork.com/17/8e/40/178e4091eddcb131be13ce883019531d.js';
  adsterraPopunder3.setAttribute('data-cfasync', 'false');
  document.head.appendChild(adsterraPopunder3);

  // Additional Adsterra Native Ad
  const adsterraNativeAd = document.createElement('script');
  adsterraNativeAd.async = true;
  adsterraNativeAd.src = 'https://curoax.com/na/waWQiOjEyMjMyNjQsInNpZCI6MTc0NjYyNSwid2lkIjo3Mzc4NzcsInNyYyI6Mn0=eyJ.js';
  document.head.appendChild(adsterraNativeAd);
}

// ─── Constants ────────────────────────────────────────────────
const COOLDOWN_SECONDS = 6 * 3600; // 6 hours
const CLAIM_AMOUNTS = { min: 0.00105, max: 0.00115 }; // Divided by 2 from DOGE
const TASK_REWARDS = { min: 0.000495, max: 0.0007495 }; // Divided by 2 from DOGE
const WITHDRAWAL_MIN = 5; // 5 TRX minimum
const WITHDRAWAL_MAX = 6; // 6 TRX maximum
const WITHDRAWAL_COOLDOWN = 7 * 24 * 3600; // 7 days

const MEME_PHRASES = [
  "wow. such coin.",
  "very generous. much wow.",
  "so doge. many riches.",
  "to the moon! 🚀",
  "such faucet. very drip.",
  "amaze. much crypto.",
];

const TRX_QUOTES = [
  { text: "energy", color: "text-red-600" },
  { text: "such speed", color: "text-red-500" },
  { text: "very fast", color: "text-red-700" },
  { text: "much tron", color: "text-red-700" },
  { text: "so generous", color: "text-red-600" },
];

// ─── Helpers ──────────────────────────────────────────────────
function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function getRandomAmount() {
  return parseFloat((Math.random() * (CLAIM_AMOUNTS.max - CLAIM_AMOUNTS.min) + CLAIM_AMOUNTS.min).toFixed(6));
}

function getRandomTaskReward() {
  return parseFloat((Math.random() * (TASK_REWARDS.max - TASK_REWARDS.min) + TASK_REWARDS.min).toFixed(6));
}

function getRandomPhrase() {
  return MEME_PHRASES[Math.floor(Math.random() * MEME_PHRASES.length)];
}

// ─── Floating coin particle ───────────────────────────────────
function FloatingCoin({ x, amount, onDone }: { x: number; amount: number; onDone: () => void }) {
  return (
    <motion.div
      className="fixed pointer-events-none z-40 font-bold text-amber-600"
      style={{ left: x, bottom: "40%" }}
      initial={{ y: 0, opacity: 1, scale: 1 }}
      animate={{ y: -120, opacity: 0, scale: 1.4 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      onAnimationComplete={onDone}
    >
      <span className="text-2xl">+{amount.toFixed(6)} Ð</span>
    </motion.div>
  );
}

// ─── Countdown Ring ───────────────────────────────────────────
function CountdownRing({ remaining, total }: { remaining: number; total: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = remaining / total;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="absolute" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="oklch(0.87 0.06 80)" strokeWidth="8" />
        <circle
          cx="72" cy="72" r={radius}
          fill="none"
          stroke="oklch(0.72 0.14 75)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 72 72)"
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div className="text-center z-10">
        <div className="font-bold text-amber-700 text-sm leading-tight">Next claim</div>
        <div className="font-bold text-amber-900 text-lg leading-tight">{formatTime(remaining)}</div>
      </div>
    </div>
  );
}

// ─// ─── Ad Space Component ───────────────────────────────────
function AdSpace({ id }: { id: string }) {
  return (
    <div
      className="w-full flex justify-center"
      id={`ad-space-${id}`}
    >
      <div style={{width: '100%', margin: 'auto', position: 'relative', zIndex: 99998}}>
        <iframe 
          data-aa='2432304' 
          src='//acceptable.a-ads.com/2432304/?size=Adaptive'
          style={{
            border: '0', 
            padding: '0', 
            width: '70%', 
            height: 'auto', 
            overflow: 'hidden',
            display: 'block',
            margin: 'auto'
          }}
        />
      </div>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────
function TaskCard({ task, onComplete }: { task: { id: string; title: string; reward: number; action: string; link?: string }; onComplete: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleTask = async () => {
    setLoading(true);
    // Open link if provided
    if (task.link) {
      window.open(task.link, '_blank');
    }
    // Simulate task completion (watch ad, visit site, etc.)
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="doge-card p-4 space-y-3"
    >
      <h4 className="font-bold text-amber-800">{task.title}</h4>
      <p className="text-sm text-amber-600">Earn {task.reward.toFixed(6)} Ð</p>
      <motion.button
        onClick={handleTask}
        disabled={loading}
        className="doge-btn-primary w-full py-2 text-sm disabled:opacity-50"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        {loading ? "Processing..." : task.action}
      </motion.button>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [quoteIdx, setQuoteIdx] = useState(0);

  // SEO: Set page title and meta tags
  useEffect(() => {
    document.title = "Crypto TRX Faucet - Free TRX Rewards | Claim Every 6 Hours";
    
    // Set meta description
    let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaDescription) {
      metaDescription = document.createElement('meta') as HTMLMetaElement;
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = 'Crypto TRX Faucet - Earn free TRX by claiming every 6 hours, completing tasks, and watching ads. Withdraw with low minimum (0.05 TRX). Join now!';
    
    // Set meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]') as HTMLMetaElement | null;
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta') as HTMLMetaElement;
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = 'trx faucet, free trx, earn tron, crypto faucet, tron rewards, free cryptocurrency, trx rewards, tron faucet';
  }, []);
  const [memePhrase, setMemePhrase] = useState("");
  const [showMeme, setShowMeme] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [floatingCoins, setFloatingCoins] = useState<{ id: number; x: number; amount: number }[]>([]);
  const [cooldown, setCooldown] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawalPending, setWithdrawalPending] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [earnedRewards, setEarnedRewards] = useState<Set<string>>(new Set());
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [walletInput, setWalletInput] = useState("");
  const [showWalletModal, setShowWalletModal] = useState(false);
  const coinIdRef = useRef(0);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Rotate quote
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx((i) => (i + 1) % TRX_QUOTES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleConnectWallet = () => {
    const wallet = walletInput.trim();
    if (!wallet) {
      toast.error("Please enter a wallet address");
      return;
    }
    if (!wallet.startsWith("T") || wallet.length !== 34) {
      toast.error("Invalid Tron address (must start with T and be 34 characters)");
      return;
    }
    setConnectedWallet(wallet);
    setWalletInput("");
    setShowWalletModal(false);
    toast.success(`✅ Wallet connected: ${wallet.slice(0, 6)}...${wallet.slice(-4)}`);
  };

  const handleClaim = useCallback(async () => {
    if (!connectedWallet) {
      setShowWalletModal(true);
      toast.warning("Please connect your wallet first to claim TRX");
      return;
    }
    if (cooldown > 0) {
      toast.warning(`such patience needed. wait ${formatTime(cooldown)} 🕐`);
      return;
    }

    const amount = getRandomAmount();
    const phrase = getRandomPhrase();

    // Update balance and set cooldown (only add once)
    setTotalBalance(prev => prev + amount);
    setCooldown(COOLDOWN_SECONDS);
    setConfettiActive(true);
    setMemePhrase(phrase);
    setShowMeme(true);
    setTimeout(() => setConfettiActive(false), 3000);
    setTimeout(() => setShowMeme(false), 3500);

    const btnRect = btnRef.current?.getBoundingClientRect();
    const x = btnRect ? btnRect.left + btnRect.width / 2 - 30 : window.innerWidth / 2 - 30;
    const id = ++coinIdRef.current;
    setFloatingCoins((prev) => [...prev, { id, x, amount }]);

    toast.success(`🎉 You claimed ${amount.toFixed(6)} TRX! ${phrase}`);
  }, [isAuthenticated, cooldown]);

  const handleTaskComplete = (reward: number) => {
    // Add task reward to user balance (only add once)
    setTotalBalance(prev => prev + reward);
    const btnRect = btnRef.current?.getBoundingClientRect();
    const x = btnRect ? btnRect.left + btnRect.width / 2 - 30 : window.innerWidth / 2 - 30;
    const id = ++coinIdRef.current;
    setFloatingCoins((prev) => [...prev, { id, x, amount: reward }]);
    toast.success(`✅ Task completed! +${reward.toFixed(6)} TRX earned`);
  };

  const handleWithdraw = async () => {
    // Check if user has enough balance
    if (totalBalance < WITHDRAWAL_MIN) {
      toast.error("You do not have enough TRX to withdraw");
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < WITHDRAWAL_MIN || amount > WITHDRAWAL_MAX) {
      toast.error(`Withdrawal must be between ${WITHDRAWAL_MIN} and ${WITHDRAWAL_MAX} TRX`);
      return;
    }
    if (amount > totalBalance) {
      toast.error("You do not have enough TRX to withdraw");
      return;
    }
    if (!withdrawAddress.trim()) {
      toast.error("Please enter a valid Tron address");
      return;
    }
    // TODO: Call backend to process withdrawal
    setWithdrawalPending(true);
    toast.success(`⏳ Withdrawal of ${amount} TRX is pending...`);
    setShowWithdrawModal(false);
    setWithdrawAmount("");
    setWithdrawAddress("");
    // Keep pending state for display
  };

  const canClaim = cooldown === 0 && isAuthenticated && connectedWallet;

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663491267937/iGc5kShpm5eo43AqpGQqJn/doge-bg-pattern-53A5pGjPPq8Z4GqBQCYEjq.webp) repeat`,
        backgroundSize: "400px 400px",
        backgroundColor: "oklch(0.98 0.02 90)",
      }}
    >
      <Confetti active={confettiActive} />

      {/* Floating coin particles */}
      {floatingCoins.map((coin) => (
        <FloatingCoin
          key={coin.id}
          x={coin.x}
          amount={coin.amount}
          onDone={() => setFloatingCoins((prev) => prev.filter((c) => c.id !== coin.id))}
        />
      ))}

      {/* ── Header ── */}
      <header className="w-full py-4 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-b-2 border-red-200 bg-red-50/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663491267937/iGc5kShpm5eo43AqpGQqJn/doge-coin-spin-dEVktWSw49vAzExbbF729d.webp"
                alt="TRX coin"
                className="w-8 sm:w-10 h-8 sm:h-10 animate-coin-bounce"
              />
          <div>
            <h1 className="text-lg sm:text-2xl text-red-800 leading-none" style={{ fontFamily: "'Fredoka One', cursive" }}>
              TRX Faucet
            </h1>
            <p className="text-xs text-red-600 font-semibold">Much speed. Very TRX.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex gap-1 sm:gap-1.5 w-full sm:w-auto justify-center flex-wrap">
            <motion.button
              onClick={() => navigate('/')}
              className="px-1.5 sm:px-3 py-1 text-xs sm:text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-bold whitespace-nowrap"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Switch to DOGE Faucet"
            >
              🐕 DOGE
            </motion.button>
            <motion.button
              onClick={() => navigate('/sol')}
              className="px-1.5 sm:px-3 py-1 text-xs sm:text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-bold whitespace-nowrap"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Switch to SOL Faucet"
            >
              ◎ SOL
            </motion.button>
            <motion.button
              onClick={() => navigate('/btc')}
              className="px-1.5 sm:px-3 py-1 text-xs sm:text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-bold whitespace-nowrap"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Switch to BTC Faucet"
            >
              ₿ BTC
            </motion.button>
            <button onClick={() => navigate("/leaderboard")} className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition font-bold">
              🏆 Leaderboard
            </button>
            <button onClick={() => navigate("/referrals")} className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition font-bold">
              🎁 Referrals
            </button>
            <button onClick={() => navigate("/stats")} className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition font-bold">
              📊 Stats
            </button>
            <button onClick={() => navigate("/mining-dashboard")} className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-bold">
              ⛏️ Mining
            </button>
          </div>
          <div className="flex items-center gap-2 bg-red-100 border-2 border-red-300 rounded-xl px-3 sm:px-4 py-2 w-full sm:w-auto justify-center">
            <span className="text-red-600 text-xs sm:text-sm font-bold">Balance:</span>
            <span className="text-red-800 font-extrabold text-sm sm:text-sm">
              {totalBalance.toFixed(4)} TRX
            </span>
          </div>
          {connectedWallet ? (
            <div className="bg-green-100 border-2 border-green-400 rounded-xl px-3 py-2 text-center w-full sm:w-auto">
              <p className="text-xs text-green-600 font-bold">Wallet</p>
              <p className="text-xs sm:text-sm text-green-800 font-mono font-bold">{connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}</p>
            </div>
          ) : (
            <motion.button
              onClick={() => setShowWalletModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 sm:px-4 py-2 rounded-lg transition text-sm w-full sm:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔗 Connect Wallet
            </motion.button>
          )}
        </div>
      </header>

      {/* ── Ad Space 1 (Top Banner - Adsterra) ── */}
      <div className="container py-4">
        <div className="w-full flex justify-center">
          <div id="container-0ee654d9e26c67d753bcd60504761f2b" style={{width: '100%', minHeight: '100px'}}></div>
        </div>
      </div>

      {/* ── Hero Section ── */}
      <section className="container py-8 md:py-12">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Left: Hero image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="md:col-span-1 flex justify-center"
          >
            <div className="relative">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663491267937/iGc5kShpm5eo43AqpGQqJn/doge-hero-fQVDzq6YRqPVFQwJVimqwm.webp"
                alt="Doge on coins"
                className="w-full max-w-md rounded-2xl border-4 border-amber-300 shadow-xl"
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={quoteIdx}
                  initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
                  animate={{ opacity: 1, scale: 1, rotate: -6 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.4 }}
                  className={`absolute top-4 right-4 bg-white border-2 border-red-400 rounded-xl px-3 py-1.5 font-extrabold text-lg shadow-md ${TRX_QUOTES[quoteIdx].color}`}
                  style={{ fontFamily: "'Fredoka One', cursive" }}
                >
                  {TRX_QUOTES[quoteIdx].text}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Middle: Claim panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="md:col-span-1"
          >
            <div className="doge-card p-6 md:p-8 space-y-6">
              <div>
                <h2
                  className="text-4xl md:text-5xl text-red-800 leading-tight shimmer-text"
                  style={{ fontFamily: "'Fredoka One', cursive" }}
                >
                  Claim Free TRX
                </h2>
                <p className="text-red-600 font-semibold mt-1">
                  Every 6 hours!
                </p>
              </div>

              {!isAuthenticated ? (
                <motion.button
                  onClick={() => window.location.href = getLoginUrl()}
                  className="doge-btn-primary w-full py-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  🐕 Login to Claim
                </motion.button>
              ) : (
                <>
                  <div className="flex items-center gap-6">
                    <div className="flex-1">
                      <motion.button
                        ref={btnRef}
                        onClick={handleClaim}
                        disabled={!canClaim}
                        className="doge-btn-primary w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                        whileHover={canClaim ? { scale: 1.02 } : {}}
                        whileTap={canClaim ? { scale: 0.97 } : {}}
                      >
                        {cooldown > 0 ? "⏳ Come Back Later" : "⚡ Much Claim, Very TRX!"}
                      </motion.button>
                    </div>

                    {cooldown > 0 && (
                      <CountdownRing remaining={cooldown} total={COOLDOWN_SECONDS} />
                    )}
                  </div>

                  <AnimatePresence>
                    {showMeme && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="speech-bubble"
                      >
                        <p
                          className="text-amber-700 font-extrabold text-lg"
                          style={{ fontFamily: "'Fredoka One', cursive" }}
                        >
                          {memePhrase}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    onClick={() => setShowWithdrawModal(true)}
                    disabled={withdrawalPending}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {withdrawalPending ? "⏳ Withdrawal Pending" : "💰 Withdraw TRX"}
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>

          {/* Right: Ad Space 2 */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-1"
          >
            <AdSpace id="2" />
          </motion.div>
        </div>
      </section>

      {/* ── Ad Space 3 (Between sections - A-ADS) ── */}
      <div className="container py-4">
        <AdSpace id="3" />
      </div>

      {/* ── Earn Tasks Section ── */}
      {isAuthenticated && (
        <section className="container py-8">
          <h3
            className="text-3xl text-red-800 text-center mb-8"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            💪 Earn Extra TRX
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            <TaskCard
              task={{
                id: "watch-ad",
                title: "Watch Ad",
                reward: 0.000052,
                action: "Watch Now",
                link: "https://www.profitablecpmratenetwork.com/av12w48skm?key=a016e34186f663eaef12ef74f4622d62",
              }}
              onComplete={() => handleTaskComplete(0.000052)}
            />
            <TaskCard
              task={{
                id: "visit-site",
                title: "Visit Website",
                reward: 0.0000515,
                action: "Visit",
                link: "https://www.profitablecpmratenetwork.com/av12w48skm?key=a016e34186f663eaef12ef74f4622d62",
              }}
              onComplete={() => handleTaskComplete(0.0000515)}
            />
            <TaskCard
              task={{
                id: "survey",
                title: "Complete Survey",
                reward: 0.000051,
                action: "Start Survey",
                link: "https://www.profitablecpmratenetwork.com/av12w48skm?key=a016e34186f663eaef12ef74f4622d62",
              }}
              onComplete={() => handleTaskComplete(0.000051)}
            />
          </div>
        </section>
      )}

      {/* ── Ad Space 4 (Smartlink Ads with Rewards) ── */}
      <section className="container py-8">
          <h3
            className="text-3xl text-red-800 text-center mb-6"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            💵 Smartlink Offers
          </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <motion.button
            onClick={() => {
              const reward = Math.random() * (0.0007495 - 0.000445) + 0.000445;
              window.open('https://www.profitablecpmratenetwork.com/f06jub373?key=a8935f5f6d1250ce9b45339a50755bed', '_blank');
              setTotalBalance(prev => prev + reward);
              toast.success(`🎁 +${reward.toFixed(6)} TRX earned! Complete the offer to keep your reward.`);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="doge-card p-6 text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-lg hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="text-3xl mb-2">🌟</div>
            <p>Complete Offers</p>
            <p className="text-sm mt-1">Earn 0.000445-0.0007495 TRX</p>
          </motion.button>

          <motion.button
            onClick={() => {
              const reward = Math.random() * (0.0007495 - 0.000445) + 0.000445;
              window.open('https://www.profitablecpmratenetwork.com/f06jub373?key=a8935f5f6d1250ce9b45339a50755bed', '_blank');
              setTotalBalance(prev => prev + reward);
              toast.success(`🎁 +${reward.toFixed(6)} TRX earned! Complete the offer to keep your reward.`);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="doge-card p-6 text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="text-3xl mb-2">🌟</div>
            <p>Watch Videos</p>
            <p className="text-sm mt-1">Earn 0.000445-0.0007495 TRX</p>
          </motion.button>
        </div>
      </section>

      {/* ── Ad Space 5 (Native Banner) ── */}
      <div className="container py-4">
        <div className="w-full flex justify-center">
          <div id="container-0ee654d9e26c67d753bcd60504761f2b"></div>
        </div>
      </div>

      {/* ── Homepage Widget Download ── */}
      <section className="container py-8 bg-red-50 rounded-lg border-2 border-red-200 p-6">
        <h3
          className="text-2xl text-red-800 text-center mb-4"
          style={{ fontFamily: "'Fredoka One', cursive" }}
        >
          ⚡ Embed on Your Website
        </h3>
        <p className="text-red-700 text-center mb-4">Add our widget to your homepage and earn 0.00335 TRX per referral!</p>
        <div className="bg-white p-4 rounded-lg border-2 border-red-300 mb-4">
          <p className="text-xs text-red-600 mb-2 font-bold">Copy this code to your website:</p>
          <code className="text-xs bg-red-50 p-3 rounded block overflow-x-auto font-mono text-red-900">
            {`<iframe src="https://cryptotrxfaucet.org/widget" width="300" height="400" frameborder="0" style="border: 2px solid #dc2626; border-radius: 8px;"></iframe>`}
          </code>
        </div>
        <motion.button
          onClick={() => {
            const code = `<iframe src="https://cryptotrxfaucet.org/widget" width="300" height="400" frameborder="0" style="border: 2px solid #dc2626; border-radius: 8px;"></iframe>`;
            navigator.clipboard.writeText(code);
            toast.success('Widget code copied to clipboard!');
          }}
          className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-lg hover:scale-105 transition-transform"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          📋 Copy Widget Code
        </motion.button>
      </section>

      {/* ── How It Works ── */}
      <section className="container py-8">
        <h3
          className="text-3xl text-red-800 text-center mb-8"
          style={{ fontFamily: "'Fredoka One', cursive" }}
        >
          How It Works
        </h3>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: "📏", title: "Login", desc: "Sign in with your Manus account to get started." },
            { icon: "⚡", title: "Claim & Earn", desc: "Claim every 6 hours or complete tasks to earn TRX." },
            { icon: "💰", title: "Withdraw", desc: "Withdraw 0.05–0.5 TRX once per week to your wallet." },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="doge-card p-6 text-center hover:scale-105 transition-transform duration-200"
            >
              <div className="text-5xl mb-3">{step.icon}</div>
              <h4
                className="text-xl text-red-800 mb-2"
                style={{ fontFamily: "'Fredoka One', cursive" }}
              >
                {step.title}
              </h4>
              <p className="text-red-600 text-sm font-medium">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Ad Space 5 (Footer - Adsterra) ── */}
      <div className="container py-4">
        <div className="w-full flex justify-center">
          <div id="container-0ee654d9e26c67d753bcd60504761f2b"></div>
        </div>
      </div>

      {/* ── Wallet Connection Modal ── */}
      <AnimatePresence>
        {showWalletModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowWalletModal(false)}
          >
            <motion.div
              className="doge-card p-8 max-w-md w-full space-y-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-red-800" style={{ fontFamily: "'Fredoka One', cursive" }}>
                🔗 Connect Your Wallet
              </h3>
              <p className="text-red-700 text-sm">Enter your Tron address to start earning TRX!</p>
              
              <div>
                <label className="block text-red-800 font-bold text-sm mb-2">Tron Address</label>
                <input
                  type="text"
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  placeholder="Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 rounded-lg border-2 border-red-300 bg-red-50 text-red-900 font-mono text-sm focus:outline-none focus:border-red-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleConnectWallet()}
                />
                <p className="text-xs text-red-500 mt-1">Addresses start with "T" and are 34 characters long</p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowWalletModal(false)}
                  className="flex-1 py-2 bg-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-400 transition"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleConnectWallet}
                  className="flex-1 doge-btn-primary py-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Connect
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Withdrawal Modal ── */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowWithdrawModal(false)}
          >
            <motion.div
              className="doge-card p-8 max-w-md w-full space-y-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-red-800" style={{ fontFamily: "'Fredoka One', cursive" }}>
                Withdraw TRX
              </h3>

              {totalBalance < WITHDRAWAL_MIN ? (
                <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 text-center">
                  <p className="text-red-700 font-bold">❌ You do not have enough TRX to withdraw</p>
                  <p className="text-red-600 text-sm mt-2">Current balance: {totalBalance.toFixed(8)} TRX</p>
                  <p className="text-red-600 text-sm">Minimum required: {WITHDRAWAL_MIN} TRX</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-red-800 font-bold text-sm mb-1">Your Balance: {totalBalance.toFixed(8)} TRX</label>
                    <label className="block text-red-800 font-bold text-sm mb-1">Amount (TRX)</label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder={`${WITHDRAWAL_MIN} - ${WITHDRAWAL_MAX}`}
                      step="0.0001"
                      max={Math.min(totalBalance, WITHDRAWAL_MAX)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-red-300 bg-red-50 text-red-900 focus:outline-none focus:border-red-500"
                    />
                    <p className="text-xs text-red-500 mt-1">Min: {WITHDRAWAL_MIN} TRX | Max: {Math.min(totalBalance, WITHDRAWAL_MAX)} TRX</p>
                  </div>

                  <div>
                    <label className="block text-red-800 font-bold text-sm mb-1">Tron Address</label>
                    <input
                      type="text"
                      value={withdrawAddress}
                      onChange={(e) => setWithdrawAddress(e.target.value)}
                      placeholder="Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-4 py-2 rounded-lg border-2 border-red-300 bg-red-50 text-red-900 font-mono text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-2 bg-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-400 transition"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleWithdraw}
                  className="flex-1 doge-btn-primary py-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Withdraw
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer ── */}
      <footer className="border-t-2 border-amber-200 bg-amber-50/80 py-6 text-center">
        <p className="text-amber-600 font-semibold text-sm">
          🐕 Doge Faucet — Such free. Very DOGE. Wow.
        </p>
        <p className="text-amber-400 text-xs mt-1">
          Powered by FaucetPay • Withdrawal: Once per week • Min: {WITHDRAWAL_MIN} Ð | Max: {WITHDRAWAL_MAX} Ð
        </p>
      </footer>
    </div>
  );
}
