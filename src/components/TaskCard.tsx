import { useState } from "react";
import { Task, CATEGORIES, updateTask } from "@/lib/tasks";
import { truncateAddress, sendPayment } from "@/lib/stellar";
import { Clock, Coins, ExternalLink, User, CheckCircle, Loader2, Send, ShieldCheck, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import TxResultDialog, { TxResult } from "./TxResultDialog";

interface TaskCardProps {
  task: Task;
  publicKey: string | null;
  onUpdate: (task: Task) => void;
  index: number;
  onPaymentSuccess?: () => void;
}

const TaskCard = ({ task, publicKey, onUpdate, index, onPaymentSuccess }: TaskCardProps) => {
  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState("");
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const categoryInfo = CATEGORIES.find((c) => c.value === task.category);
  const isOwnTask = publicKey === task.posterAddress;
  const isWorker = publicKey === task.workerAddress;

  // Status check for UI
  const canClaim = publicKey && !isOwnTask && task.status === "open";
  const canSubmit = publicKey && isWorker && task.status === "in_progress";
  const canPay = isOwnTask && task.status === "completed";

  const handleClaim = () => {
    if (!publicKey) return;
    const updated = updateTask(task.id, {
      status: "in_progress",
      workerAddress: publicKey,
    });
    if (updated) {
      onUpdate(updated);
      toast.success("Task claimed! Now complete the work.");
    }
  };

  const handleSubmitWork = () => {
    if (!submission) {
      toast.error("Please provide a submission note/link");
      return;
    }
    const updated = updateTask(task.id, {
      status: "completed",
      submissionText: submission,
    });
    if (updated) {
      onUpdate(updated);
      toast.success("Work submitted! Awaiting payment from creator.");
    }
  };

  const handlePay = async () => {
    if (!publicKey || !task.workerAddress) return;

    setLoading(true);
    try {
      // destination is now the real worker address
      const result = await sendPayment(task.workerAddress, task.reward.toString(), publicKey);

      if (result.success && result.hash) {
        const updated = updateTask(task.id, {
          status: "paid",
          txHash: result.hash,
        });
        if (updated) onUpdate(updated);

        setTxResult({
          success: true,
          hash: result.hash,
          amount: task.reward.toString(),
          destination: task.workerAddress,
        });
        if (onPaymentSuccess) onPaymentSuccess();
      } else {
        setTxResult({
          success: false,
          error: result.error || "Transaction failed",
          amount: task.reward.toString(),
          destination: task.workerAddress,
        });
      }
      setShowResult(true);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<Task["status"], string> = {
    open: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    in_progress: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    completed: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className={`group rounded-2xl border bg-slate-900/40 p-6 transition-all duration-300 backdrop-blur-sm ${task.status === "paid" ? "border-emerald-500/20" : "border-slate-800 hover:border-slate-700 hover:glow-primary"
          }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm">{categoryInfo?.emoji}</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                {categoryInfo?.label}
              </span>
            </div>
            <h3 className="font-mono font-bold text-white text-lg truncate leading-tight">{task.title}</h3>
          </div>
          <span className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded-lg border uppercase tracking-wider ${statusColors[task.status]}`}>
            {task.status.replace("_", " ")}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 mb-6 line-clamp-2 leading-relaxed">{task.description}</p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-6 pt-6 border-t border-slate-800/50">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-950/50 px-2.5 py-1.5 rounded-lg border border-slate-800/30">
            <User className="w-3 h-3 text-indigo-400" />
            <span>{truncateAddress(task.posterAddress)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400 bg-indigo-500/5 px-2.5 py-1.5 rounded-lg border border-indigo-500/20">
            <Coins className="w-3 h-3" />
            <span>{task.reward} XLM</span>
          </div>
        </div>

        {/* Dynamic Content based on State */}
        <div className="space-y-4">

          {/* Worker Submitting */}
          {canSubmit && (
            <div className="space-y-3 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Submission Note</label>
              <Input
                placeholder="Link to work or summary..."
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                className="bg-slate-900 border-slate-700 h-10 text-sm focus:ring-1 focus:ring-amber-500"
              />
              <Button
                onClick={handleSubmitWork}
                size="sm"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
              >
                <Send className="w-3.5 h-3.5 mr-2" /> Submit Work
              </Button>
            </div>
          )}

          {/* Submission Preview for Poster */}
          {task.submissionText && (
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                <MessageSquare className="w-3 h-3" /> Worker Submission
              </div>
              <p className="text-sm text-slate-300 italic">"{task.submissionText}"</p>
              {task.workerAddress && (
                <p className="text-[10px] text-slate-500 mt-2 font-mono">From: {truncateAddress(task.workerAddress)}</p>
              )}
            </div>
          )}

          {/* Main Action Buttons */}
          {canClaim && (
            <Button
              onClick={handleClaim}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold h-11 rounded-xl shadow-lg shadow-blue-500/10 transition-all active:scale-95"
            >
              Claim Task
            </Button>
          )}

          {canPay && (
            <Button
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
              Pay Worker {task.reward} XLM
            </Button>
          )}

          {task.status === "paid" && task.txHash && (
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${task.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 w-full rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 font-mono text-xs hover:bg-emerald-500/10 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Paid Successfully — View Receipt
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {isOwnTask && task.status === "open" && (
            <p className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-widest italic pt-2">
              Awaiting worker to claim...
            </p>
          )}
        </div>
      </motion.div>

      {/* Transaction Result Dialog */}
      <TxResultDialog
        result={txResult}
        open={showResult}
        onClose={() => setShowResult(false)}
      />
    </>
  );
};

export default TaskCard;
