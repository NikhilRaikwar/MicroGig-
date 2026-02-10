import { useState, useCallback, useEffect } from "react";
import { connectWallet, fetchBalance, isFreighterInstalled, truncateAddress, fundWithFriendbot } from "@/lib/stellar";
import { Wallet, LogOut, Copy, ExternalLink, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface WalletBarProps {
  publicKey: string | null;
  balance: string;
  onConnect: (key: string) => void;
  onDisconnect: () => void;
  onRefreshBalance: () => void;
}

const WalletBar = ({ publicKey, balance, onConnect, onDisconnect, onRefreshBalance }: WalletBarProps) => {
  const [loading, setLoading] = useState(false);

  const handleConnect = useCallback(async () => {
    setLoading(true);
    try {
      const key = await connectWallet();
      if (key) {
        onConnect(key);
      }
    } finally {
      setLoading(false);
    }
  }, [onConnect]);

  const handleDisconnect = useCallback(() => {
    onDisconnect();
    toast.info("Wallet disconnected");
  }, [onDisconnect]);

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      toast.success("Address copied!");
    }
  };

  const handleFund = async () => {
    if (publicKey) {
      await fundWithFriendbot(publicKey);
      onRefreshBalance();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <AnimatePresence mode="wait">
        {publicKey ? (
          <motion.div
            key="connected"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center gap-2"
          >
            {/* Balance */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border">
              <Coins className="w-3.5 h-3.5 text-accent" />
              <span className="font-mono text-sm text-accent font-semibold">
                {balance !== null ? `${balance} XLM` : "..."}
              </span>
            </div>

            {/* Address */}
            <button
              onClick={copyAddress}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border hover:border-primary/50 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
              <span className="font-mono text-sm text-foreground">
                {truncateAddress(publicKey)}
              </span>
              <Copy className="w-3 h-3 text-muted-foreground" />
            </button>

            {/* Fund button (testnet) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFund}
              className="text-xs text-muted-foreground hover:text-accent"
              title="Fund with Friendbot (Testnet)"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline ml-1">Fund</span>
            </Button>

            {/* Disconnect */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="disconnected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              onClick={handleConnect}
              disabled={loading}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary font-mono text-sm"
            >
              <Wallet className="w-4 h-4" />
              {loading ? "Connecting..." : "Connect Wallet"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletBar;
