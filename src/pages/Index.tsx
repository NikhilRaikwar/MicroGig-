import { useState, useEffect, useCallback } from "react";
import { Task, loadTasks, CATEGORIES } from "@/lib/tasks";
import Navbar from "@/components/Navbar";
import PostTaskForm from "@/components/PostTaskForm";
import TaskCard from "@/components/TaskCard";
import { motion } from "framer-motion";
import { Search, Filter, Zap, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";

const Index = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!publicKey) return;
    const { fetchBalance } = await import("@/lib/stellar");
    const bal = await fetchBalance(publicKey);
    setBalance(bal);
  }, [publicKey]);

  useEffect(() => {
    if (publicKey) {
      refreshBalance();
      // Poll every 10 seconds
      const interval = setInterval(refreshBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [publicKey, refreshBalance]);

  const handleTaskPosted = useCallback((task: Task) => {
    setTasks((prev) => [task, ...prev]);
  }, []);

  const handleTaskUpdate = useCallback((updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }, []);

  const filteredTasks = tasks.filter((t) => {
    if (filter !== "all" && t.category !== filter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Navbar
        publicKey={publicKey}
        balance={balance}
        onConnect={setPublicKey}
        onDisconnect={() => setPublicKey(null)}
        onRefreshBalance={refreshBalance}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono mb-6">
            <Zap className="w-3 h-3" />
            Built on Stellar Testnet
          </div>
          <h1 className="text-4xl md:text-5xl font-mono font-bold mb-4 leading-tight">
            Nano-tasks,{" "}
            <span className="text-gradient-primary">nano-fees</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8 font-sans">
            Post and complete micro-tasks for 1–10 XLM. Fast payments, near-zero fees, powered by Stellar.
          </p>

          {!publicKey && (
            <p className="text-sm text-muted-foreground font-mono flex items-center justify-center gap-2">
              Connect your Freighter wallet to get started
              <ArrowRight className="w-4 h-4 text-primary" />
            </p>
          )}
        </motion.section>

        {/* Post Task + Controls */}
        <div className="flex flex-col items-center gap-6 mb-8">
          <PostTaskForm publicKey={publicKey} onTaskPosted={handleTaskPosted} />

          {/* Filters */}
          <div className="w-full max-w-4xl flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary border-border font-sans"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-md text-xs font-mono whitespace-nowrap transition-colors ${filter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setFilter(c.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono whitespace-nowrap transition-colors ${filter === c.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                    }`}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Task Grid */}
        {filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {filteredTasks.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                publicKey={publicKey}
                onUpdate={handleTaskUpdate}
                index={i}
                onPaymentSuccess={refreshBalance}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-mono text-foreground mb-2">No tasks yet</h3>
            <p className="text-sm text-muted-foreground">
              {publicKey
                ? "Be the first to post a nano-task!"
                : "Connect your wallet to post or accept tasks"}
            </p>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-16">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground font-mono">
          <span>MicroGig — Stellar Journey to Mastery · Level 1</span>
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Stellar Expert Testnet ↗
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Index;
