"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, ExternalLink, Sparkles, Zap } from "lucide-react";

interface Discovery {
  title: string;
  hook: string;
  deepDive: string;
  searchQuery: string;
}

const TOPICS = [
  "Cybernetics",
  "Lost History",
  "Generative Art",
  "Quantum Physics",
  "Deep Sea",
  "Forgotten Inventions",
  "Surprise Me",
];

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState("Surprise Me");
  const [discovery, setDiscovery] = useState<Discovery | null>(null);
  const [loading, setLoading] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  const [error, setError] = useState<string | null>(null);

  const stumble = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stumble", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: selectedTopic }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch discovery");
      }
      
      setDiscovery(data);
      setCardKey((k) => k + 1);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
      setDiscovery(null);
    } finally {
      setLoading(false);
    }
  }, [selectedTopic]);

  return (
    <div className="relative z-10 flex flex-col h-dvh font-sans">
      {/* Top Nav */}
      <nav className="flex items-center justify-between px-6 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <Compass className="w-6 h-6 text-signal-orange" />
          <span className="text-xl font-bold tracking-tight">Stumble.ai</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-mono text-foreground/40">
          <Zap className="w-3 h-3" />
          AI-Powered Discovery
        </div>
      </nav>

      {/* Topic Selector */}
      <div className="flex justify-center px-4 pb-4 shrink-0">
        <div className="flex flex-wrap justify-center gap-2">
          {TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                selectedTopic === topic
                  ? "bg-signal-orange/15 border-signal-orange/50 text-signal-orange"
                  : "bg-glass border-glass-border text-foreground/60 hover:bg-glass-hover hover:text-foreground/80"
              }`}
              style={{
                backdropFilter: "blur(12px)",
              }}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Discovery Card Area */}
      <div className="flex-1 flex items-center justify-center px-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-6"
            >
              {/* Animated loading cube */}
              <div className="relative w-16 h-16">
                <motion.div
                  className="absolute inset-0 rounded-xl border border-signal-orange/40"
                  animate={{
                    rotate: [0, 90, 180, 270, 360],
                    scale: [1, 1.1, 1, 0.9, 1],
                    borderColor: [
                      "rgba(255,107,0,0.4)",
                      "rgba(255,107,0,0.8)",
                      "rgba(255,107,0,0.4)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-2 rounded-lg bg-signal-orange/10"
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-signal-orange" />
              </div>
              <p className="text-sm font-mono text-foreground/40 tracking-wider uppercase">
                Discovering something mind-blowing...
              </p>
            </motion.div>
          ) : discovery ? (
            <motion.div
              key={`card-${cardKey}`}
              initial={{ opacity: 0, y: 40, rotateX: 8 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: -40, rotateX: -8 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-lg"
            >
              <div
                className="relative rounded-2xl border border-glass-border p-8 overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                  backdropFilter: "blur(24px)",
                }}
              >
                {/* Shimmer accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,107,0,0.5), transparent)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 3s ease-in-out infinite",
                  }}
                />

                <div className="flex items-start gap-3 mb-4">
                  <div className="shrink-0 mt-1 w-2 h-2 rounded-full bg-signal-orange" />
                  <h2 className="text-2xl font-bold leading-tight tracking-tight">
                    {discovery.title}
                  </h2>
                </div>

                <p className="text-lg text-signal-orange/90 font-medium leading-relaxed mb-4">
                  {discovery.hook}
                </p>

                <p className="text-foreground/60 leading-relaxed mb-6">
                  {discovery.deepDive}
                </p>

                {/* Explore button */}
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(discovery.searchQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-glass-border bg-glass text-foreground/70 hover:text-foreground hover:bg-glass-hover transition-all duration-200"
                  style={{ backdropFilter: "blur(12px)" }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Explore Rabbit Hole
                </a>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <Compass className="w-16 h-16 mx-auto mb-4 text-foreground/10" />
              <p className="text-lg text-foreground/30 font-medium">
                Ready to discover something incredible?
              </p>
              <p className="text-sm text-foreground/20 font-mono mt-2">
                Pick a topic and hit Stumble
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Dock */}
      <div className="shrink-0 flex justify-center pb-8 pt-4 px-6">
        <button
          onClick={stumble}
          disabled={loading}
          className="relative px-12 py-4 rounded-2xl text-lg font-bold text-white transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          style={{
            background:
              "linear-gradient(135deg, #FF6B00 0%, #FF8C33 100%)",
            animation: loading ? "none" : "pulse-glow 2.5s ease-in-out infinite",
          }}
        >
          <span className="relative z-10 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            {loading ? "Discovering..." : "Stumble"}
          </span>
        </button>
      </div>
    </div>
  );
}
