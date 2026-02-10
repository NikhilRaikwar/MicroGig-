import { useState } from "react";
import { Task, CATEGORIES, addTask } from "@/lib/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface PostTaskFormProps {
  publicKey: string | null;
  onTaskPosted: (task: Task) => void;
}

const PostTaskForm = ({ publicKey, onTaskPosted }: PostTaskFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Task["category"]>("other");
  const [reward, setReward] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      toast.error("Connect your wallet first");
      return;
    }

    const rewardNum = parseFloat(reward);
    if (isNaN(rewardNum) || rewardNum < 1 || rewardNum > 10) {
      toast.error("Reward must be between 1 and 10 XLM");
      return;
    }

    if (!title.trim() || !description.trim()) {
      toast.error("Fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const newTask = addTask({
        title: title.trim(),
        description: description.trim(),
        category,
        reward: rewardNum,
        posterAddress: publicKey,
        deadline: deadline || undefined,
      });
      onTaskPosted(newTask);
      toast.success("Task posted!", { description: `${rewardNum} XLM reward` });
      setTitle("");
      setDescription("");
      setReward("");
      setDeadline("");
      setCategory("other");
      setIsOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => {
          if (!publicKey) {
            toast.error("Connect your wallet to post tasks");
            return;
          }
          setIsOpen(true);
        }}
        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary font-mono"
        size="lg"
      >
        <Plus className="w-5 h-5" />
        Post a Task
      </Button>
    );
  }

  return (
    <AnimatePresence>
      <motion.form
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-mono font-semibold text-foreground">New Nano-Task</h3>
          <button type="button" onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <Input
          placeholder="Task title (e.g., Translate 100 words to Hindi)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-secondary border-border font-sans"
          required
        />

        <Textarea
          placeholder="Describe what you need done..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-secondary border-border font-sans min-h-[80px]"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select value={category} onValueChange={(v) => setCategory(v as Task["category"])}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.emoji} {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            min="1"
            max="10"
            step="0.1"
            placeholder="Reward (1-10 XLM)"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            className="bg-secondary border-border font-mono"
            required
          />

          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="bg-secondary border-border"
          />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono"
        >
          {submitting ? "Posting..." : "Post Task →"}
        </Button>
      </motion.form>
    </AnimatePresence>
  );
};

export default PostTaskForm;
