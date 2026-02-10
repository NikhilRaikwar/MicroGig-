import { CheckCircle, XCircle, ExternalLink, Copy, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { truncateAddress } from "@/lib/stellar";

export interface TxResult {
  success: boolean;
  hash?: string;
  error?: string;
  amount?: string;
  destination?: string;
}

interface TxResultDialogProps {
  result: TxResult | null;
  open: boolean;
  onClose: () => void;
}

const TxResultDialog = ({ result, open, onClose }: TxResultDialogProps) => {
  if (!result) return null;

  const explorerUrl = result.hash
    ? `https://stellar.expert/explorer/testnet/tx/${result.hash}`
    : null;

  const copyHash = () => {
    if (result.hash) {
      navigator.clipboard.writeText(result.hash);
      toast.success("Transaction hash copied!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono text-foreground text-center">
            Transaction Result
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4 gap-4">
          {/* Status Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            {result.success ? (
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
                <div className="absolute inset-0 w-20 h-20 rounded-full bg-success/20 animate-ping" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
            )}
          </motion.div>

          {/* Status Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h3 className="font-mono font-bold text-lg text-foreground mb-1">
              {result.success ? "Payment Successful!" : "Payment Failed"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {result.success
                ? "Your XLM has been sent on Stellar Testnet"
                : result.error || "Something went wrong"}
            </p>
          </motion.div>

          {/* Transaction Details */}
          {result.success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="w-full space-y-3 bg-secondary/50 rounded-lg p-4 border border-border"
            >
              {result.amount && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Amount</span>
                  <span className="font-mono font-semibold text-accent text-sm">
                    {result.amount} XLM
                  </span>
                </div>
              )}

              {result.destination && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Recipient</span>
                  <span className="font-mono text-foreground text-sm">
                    {truncateAddress(result.destination, 6)}
                  </span>
                </div>
              )}

              {result.hash && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Tx Hash</span>
                  <button
                    onClick={copyHash}
                    className="flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                  >
                    {truncateAddress(result.hash, 8)}
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Network</span>
                <span className="font-mono text-xs text-foreground">Stellar Testnet</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <span className="font-mono text-xs text-success font-semibold">Confirmed ✓</span>
              </div>
            </motion.div>
          )}

          {/* Error Details */}
          {!result.success && result.error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="w-full bg-destructive/5 rounded-lg p-4 border border-destructive/20"
            >
              <p className="text-sm text-destructive font-mono">{result.error}</p>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-3 w-full pt-2"
          >
            {explorerUrl && (
              <Button
                asChild
                className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs"
              >
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  View on Stellar Expert
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 font-mono text-xs border-border"
            >
              {result.success ? "Done" : "Close"}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TxResultDialog;
