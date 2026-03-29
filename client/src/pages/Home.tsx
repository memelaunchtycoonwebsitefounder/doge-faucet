/* =============================================================
   DOGE FAUCET — Home Page
   Design: Warm Brutalism + Meme Aesthetic
   Colors: Cream (#fef9ec) bg, Dogecoin gold primary, earthy orange accent
   Fonts: Fredoka One (display) + Nunito (body)
   ============================================================= */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Confetti from "@/components/Confetti";

// ─── Constants ────────────────────────────────────────────────
const COOLDOWN_SECONDS = 3600; // 1 hour
const CLAIM_AMOUNTS = [10, 25, 50, 100, 250];
const STORAGE_KEY_LAST_CLAIM = "doge_last_claim";
const STORAGE_KEY_TOTAL = "doge_total_claimed";
const STORAGE_KEY_LEADERBOARD = "doge_leaderboard";
const STORAGE_KEY_ADDRESS = "doge_address";

const MEME_PHRASES = [
  "wow. such coin.",
  "very generous. much wow.",
  "so doge. many riches.",
  "to the moon! 🚀",
  "such faucet. very drip.",
  "amaze. much crypto.",
];

const DOGE_QUOTES = [
  { text: "wow", color: "text-amber-600" },
  { text: "such coin", color: "text-orange-500" },
  { text: "very free", color: "text-yellow-600" },
  { text: "much wow", color: "text-amber-700" },
  { text: "so generous", color: "text-orange-600" },
];

// ─── Types ────────────────────────────────────────────────────
interface LeaderboardEntry {
  address: string;
  total: number;
  claims: number;
}

// ─── Helpers ──────────────────────────────────────────────────
function formatAddress(addr: string) {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function getRandomAmount() {
  return CLAIM_AMOUNTS[Math.floor(Math.random() * CLAIM_AMOUNTS.length)];
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
      <span className="text-2xl">+{amount} Ð</span>
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

// ─── Main Component ───────────────────────────────────────────
export default function Home() {
  const [address, setAddress] = useState(() => localStorage.getItem(STORAGE_KEY_ADDRESS) || "");
  const [inputAddress, setInputAddress] = useState(() => localStorage.getItem(STORAGE_KEY_ADDRESS) || "");
  const [totalClaimed, setTotalClaimed] = useState(() => Number(localStorage.getItem(STORAGE_KEY_TOTAL)) || 0);
  const [cooldown, setCooldown] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [floatingCoins, setFloatingCoins] = useState<{ id: number; x: number; amount: number }[]>([]);
  const [lastClaimed, setLastClaimed] = useState(0);
  const [claimCount, setClaimCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [memePhrase, setMemePhrase] = useState("");
  const [showMeme, setShowMeme] = useState(false);
  const coinIdRef = useRef(0);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Load leaderboard
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LEADERBOARD);
      if (raw) setLeaderboard(JSON.parse(raw));
    } catch {}
  }, []);

  // Compute cooldown from last claim
  useEffect(() => {
    const lastClaim = Number(localStorage.getItem(STORAGE_KEY_LAST_CLAIM)) || 0;
    setLastClaimed(lastClaim);
    const elapsed = Math.floor((Date.now() - lastClaim) / 1000);
    const remaining = Math.max(0, COOLDOWN_SECONDS - elapsed);
    setCooldown(remaining);
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

  // Rotate quote
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx((i) => (i + 1) % DOGE_QUOTES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Persist address
  useEffect(() => {
    if (address) localStorage.setItem(STORAGE_KEY_ADDRESS, address);
  }, [address]);

  const updateLeaderboard = useCallback((addr: string, amount: number) => {
    setLeaderboard((prev) => {
      const existing = prev.find((e) => e.address === addr);
      let updated: LeaderboardEntry[];
      if (existing) {
        updated = prev.map((e) =>
          e.address === addr
            ? { ...e, total: e.total + amount, claims: e.claims + 1 }
            : e
        );
      } else {
        updated = [...prev, { address: addr, total: amount, claims: 1 }];
      }
      updated.sort((a, b) => b.total - a.total);
      updated = updated.slice(0, 10);
      localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleClaim = useCallback(async () => {
    const trimmed = inputAddress.trim();
    if (!trimmed) {
      toast.error("wow. need address first! 🐕");
      return;
    }
    if (cooldown > 0) {
      toast.warning(`such patience needed. wait ${formatTime(cooldown)} 🕐`);
      return;
    }

    setAddress(trimmed);
    setIsClaiming(true);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1200));

    const amount = getRandomAmount();
    const phrase = getRandomPhrase();

    // Update state
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY_LAST_CLAIM, String(now));
    const newTotal = totalClaimed + amount;
    localStorage.setItem(STORAGE_KEY_TOTAL, String(newTotal));
    setTotalClaimed(newTotal);
    setLastClaimed(now);
    setCooldown(COOLDOWN_SECONDS);
    setClaimCount((c) => c + 1);
    updateLeaderboard(trimmed, amount);

    // Celebrations
    setIsClaiming(false);
    setConfettiActive(true);
    setMemePhrase(phrase);
    setShowMeme(true);
    setTimeout(() => setConfettiActive(false), 3000);
    setTimeout(() => setShowMeme(false), 3500);

    // Floating coin
    const btnRect = btnRef.current?.getBoundingClientRect();
    const x = btnRect ? btnRect.left + btnRect.width / 2 - 30 : window.innerWidth / 2 - 30;
    const id = ++coinIdRef.current;
    setFloatingCoins((prev) => [...prev, { id, x, amount }]);

    toast.success(`🎉 You claimed ${amount} DOGE! ${phrase}`);
  }, [inputAddress, cooldown, totalClaimed, updateLeaderboard]);

  const canClaim = cooldown === 0 && inputAddress.trim().length > 0;

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
      <header className="w-full py-4 px-6 flex items-center justify-between border-b-2 border-amber-200 bg-amber-50/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663491267937/iGc5kShpm5eo43AqpGQqJn/doge-coin-spin-dEVktWSw49vAzExbbF729d.webp"
            alt="Doge coin"
            className="w-10 h-10 animate-coin-bounce"
          />
          <div>
            <h1 className="text-2xl text-amber-800 leading-none" style={{ fontFamily: "'Fredoka One', cursive" }}>
              Doge Faucet
            </h1>
            <p className="text-xs text-amber-600 font-semibold">Much free. Very DOGE.</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-amber-100 border-2 border-amber-300 rounded-xl px-4 py-2">
          <span className="text-amber-600 text-sm font-bold">Total Distributed:</span>
          <span className="text-amber-800 font-extrabold text-sm">
            {(leaderboard.reduce((s, e) => s + e.total, 0) + totalClaimed).toLocaleString()} Ð
          </span>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="container py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Hero image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="relative">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663491267937/iGc5kShpm5eo43AqpGQqJn/doge-hero-fQVDzq6YRqPVFQwJVimqwm.webp"
                alt="Doge on coins"
                className="w-full max-w-md rounded-2xl border-4 border-amber-300 shadow-xl"
              />
              {/* Floating meme quotes */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={quoteIdx}
                  initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
                  animate={{ opacity: 1, scale: 1, rotate: -6 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.4 }}
                  className={`absolute top-4 right-4 bg-white border-2 border-amber-400 rounded-xl px-3 py-1.5 font-extrabold text-lg shadow-md ${DOGE_QUOTES[quoteIdx].color}`}
                  style={{ fontFamily: "'Fredoka One', cursive" }}
                >
                  {DOGE_QUOTES[quoteIdx].text}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right: Claim panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="doge-card p-6 md:p-8 space-y-6">
              {/* Title */}
              <div>
                <h2
                  className="text-4xl md:text-5xl text-amber-800 leading-tight shimmer-text"
                  style={{ fontFamily: "'Fredoka One', cursive" }}
                >
                  Claim Free DOGE
                </h2>
                <p className="text-amber-600 font-semibold mt-1">
                  Enter your Dogecoin address and claim every hour!
                </p>
              </div>

              {/* Address input */}
              <div className="space-y-2">
                <label className="block text-amber-800 font-bold text-sm uppercase tracking-wide">
                  Your Dogecoin Address
                </label>
                <input
                  type="text"
                  value={inputAddress}
                  onChange={(e) => setInputAddress(e.target.value)}
                  placeholder="D7xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 rounded-xl border-2 border-amber-300 bg-amber-50 text-amber-900 font-mono text-sm placeholder-amber-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                />
                <p className="text-xs text-amber-500 font-medium">
                  Dogecoin addresses start with "D" and are 34 characters long
                </p>
              </div>

              {/* Claim button + countdown */}
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <motion.button
                    ref={btnRef}
                    onClick={handleClaim}
                    disabled={!canClaim || isClaiming}
                    className="doge-btn-primary w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    whileHover={canClaim ? { scale: 1.02 } : {}}
                    whileTap={canClaim ? { scale: 0.97 } : {}}
                  >
                    {isClaiming ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          className="inline-block"
                        >
                          🐕
                        </motion.span>
                        Fetching DOGE...
                      </span>
                    ) : cooldown > 0 ? (
                      "⏳ Come Back Later"
                    ) : (
                      "🐕 Much Claim, Very DOGE!"
                    )}
                  </motion.button>
                </div>

                {cooldown > 0 && (
                  <CountdownRing remaining={cooldown} total={COOLDOWN_SECONDS} />
                )}
              </div>

              {/* Meme speech bubble on success */}
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

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t-2 border-amber-100">
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-amber-700" style={{ fontFamily: "'Fredoka One', cursive" }}>
                    {totalClaimed.toLocaleString()}
                  </div>
                  <div className="text-xs text-amber-500 font-semibold uppercase tracking-wide">Your DOGE</div>
                </div>
                <div className="text-center border-x-2 border-amber-100">
                  <div className="text-2xl font-extrabold text-amber-700" style={{ fontFamily: "'Fredoka One', cursive" }}>
                    {claimCount}
                  </div>
                  <div className="text-xs text-amber-500 font-semibold uppercase tracking-wide">Claims</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-amber-700" style={{ fontFamily: "'Fredoka One', cursive" }}>
                    {CLAIM_AMOUNTS[CLAIM_AMOUNTS.length - 1]}
                  </div>
                  <div className="text-xs text-amber-500 font-semibold uppercase tracking-wide">Max DOGE</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="container py-8">
        <h3
          className="text-3xl text-amber-800 text-center mb-8"
          style={{ fontFamily: "'Fredoka One', cursive" }}
        >
          How It Works
        </h3>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: "📝", title: "Enter Address", desc: "Paste your Dogecoin wallet address. Any valid D-address works!" },
            { icon: "🐕", title: "Click Claim", desc: "Hit the big button and let the Doge gods decide your reward (10–250 DOGE)." },
            { icon: "⏰", title: "Wait & Repeat", desc: "Come back every hour to claim again. Such patience. Very worth." },
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
                className="text-xl text-amber-800 mb-2"
                style={{ fontFamily: "'Fredoka One', cursive" }}
              >
                {step.title}
              </h4>
              <p className="text-amber-600 text-sm font-medium">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Leaderboard ── */}
      {leaderboard.length > 0 && (
        <section className="container py-8 pb-16">
          <h3
            className="text-3xl text-amber-800 text-center mb-6"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            🏆 Top Claimers
          </h3>
          <div className="max-w-2xl mx-auto doge-card overflow-hidden">
            <div className="bg-amber-100 px-6 py-3 border-b-2 border-amber-200 grid grid-cols-4 gap-2">
              <span className="text-amber-700 font-bold text-sm uppercase tracking-wide">Rank</span>
              <span className="text-amber-700 font-bold text-sm uppercase tracking-wide col-span-2">Address</span>
              <span className="text-amber-700 font-bold text-sm uppercase tracking-wide text-right">Total DOGE</span>
            </div>
            {leaderboard.map((entry, i) => (
              <motion.div
                key={entry.address}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`px-6 py-3 grid grid-cols-4 gap-2 items-center border-b border-amber-100 last:border-0 ${
                  i === 0 ? "bg-amber-50" : ""
                }`}
              >
                <span className="font-extrabold text-lg" style={{ fontFamily: "'Fredoka One', cursive" }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </span>
                <span className="font-mono text-sm text-amber-800 col-span-2 truncate">
                  {formatAddress(entry.address)}
                </span>
                <span className="text-right font-bold text-amber-700">
                  {entry.total.toLocaleString()} Ð
                </span>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="border-t-2 border-amber-200 bg-amber-50/80 py-6 text-center">
        <p className="text-amber-600 font-semibold text-sm">
          🐕 Doge Faucet — Such free. Very DOGE. Wow.
        </p>
        <p className="text-amber-400 text-xs mt-1">
          This is a simulated faucet for demonstration purposes. No real DOGE is distributed.
        </p>
      </footer>
    </div>
  );
}
