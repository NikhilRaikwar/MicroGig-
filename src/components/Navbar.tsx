import { Zap } from "lucide-react";
import WalletBar from "./WalletBar";

interface NavbarProps {
  publicKey: string | null;
  balance: string;
  onConnect: (key: string) => void;
  onDisconnect: () => void;
  onRefreshBalance: () => void;
}

const Navbar = ({ publicKey, balance, onConnect, onDisconnect, onRefreshBalance }: NavbarProps) => {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo... (unchanged) */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Zap className="w-7 h-7 text-primary" />
            <div className="absolute inset-0 w-7 h-7 text-primary blur-md opacity-50">
              <Zap className="w-7 h-7" />
            </div>
          </div>
          <div>
            <h1 className="font-mono font-bold text-lg tracking-tight text-foreground">
              Micro<span className="text-gradient-primary">Gig</span>
            </h1>
            <p className="text-[10px] text-muted-foreground font-mono -mt-1 tracking-widest uppercase">
              Stellar Testnet
            </p>
          </div>
        </div>

        {/* Wallet */}
        <WalletBar
          publicKey={publicKey}
          balance={balance}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          onRefreshBalance={onRefreshBalance}
        />
      </div>
    </nav>
  );
};

export default Navbar;
