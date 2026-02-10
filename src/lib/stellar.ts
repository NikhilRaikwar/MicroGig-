import { toast } from "sonner";
import {
  isConnected,
  setAllowed,
  requestAccess,
  getPublicKey,
  signTransaction,
} from "@stellar/freighter-api";

// Types
export interface StellarWallet {
  publicKey: string;
  isConnected: boolean;
}

// Check if Freighter extension is installed
export const isFreighterInstalled = async (): Promise<boolean> => {
  try {
    const connected = await isConnected();
    return !!connected;
  } catch {
    return false;
  }
};

// Connect wallet via Freighter
export const connectWallet = async (): Promise<string | null> => {
  try {
    const connected = await isConnected();
    if (!connected) {
      toast.error("Freighter not found", {
        description: "Please install the Freighter wallet extension from freighter.app",
      });
      window.open("https://www.freighter.app/", "_blank");
      return null;
    }

    await setAllowed();

    // Try to get address using getAddress (newer) first, then fallback to getPublicKey
    let address = "";
    try {
      // @ts-ignore
      const result = await import("@stellar/freighter-api").then(m => m.getAddress());
      address = result.address;
    } catch (e) {
      console.warn("getAddress failed, falling back to getPublicKey", e);
      // @ts-ignore
      address = await getPublicKey();
    }

    if (address) {
      toast.success("Wallet connected!", {
        description: `${address.slice(0, 6)}...${address.slice(-4)}`,
      });
      return address;
    }

    toast.error("Failed to get wallet address");
    return null;
  } catch (error: any) {
    console.error("Wallet connect error:", error);
    if (error?.message?.includes("User declined")) {
      toast.error("Connection declined by user");
    } else {
      toast.error("Failed to connect wallet", {
        description: error?.message || "Unknown error",
      });
    }
    return null;
  }
};

// Fetch XLM balance
export const fetchBalance = async (publicKey: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://horizon-testnet.stellar.org/accounts/${publicKey}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return "0";
      }
      throw new Error("Failed to fetch account");
    }

    const data = await response.json();
    const nativeBalance = data.balances.find(
      (b: any) => b.asset_type === "native"
    );
    return nativeBalance ? parseFloat(nativeBalance.balance).toFixed(7) : "0";
  } catch (error) {
    console.error("Balance fetch error:", error);
    return "0";
  }
};

// Send XLM payment
export const sendPayment = async (
  destinationAddress: string,
  amount: string,
  senderPublicKey: string
): Promise<{ success: boolean; hash?: string; error?: string }> => {
  try {
    // Fetch sender account
    const accountRes = await fetch(
      `https://horizon-testnet.stellar.org/accounts/${senderPublicKey}`
    );
    if (!accountRes.ok) {
      return { success: false, error: "Sender account not found. Fund via Friendbot first." };
    }
    const accountData = await accountRes.json();

    // Check balance
    const native = accountData.balances.find((b: any) => b.asset_type === "native");
    if (!native || parseFloat(native.balance) < parseFloat(amount) + 1) {
      return { success: false, error: "Insufficient XLM balance (need extra for fees)" };
    }

    // Build transaction using Stellar SDK
    const { TransactionBuilder, Networks, Operation, Asset } = await import("@stellar/stellar-sdk");
    const StellarSdk = await import("@stellar/stellar-sdk");

    const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
    const account = await server.loadAccount(senderPublicKey);

    const transaction = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: destinationAddress,
          asset: Asset.native(),
          amount: parseFloat(amount).toFixed(7),
        })
      )
      .setTimeout(60)
      .build();

    const xdr = transaction.toXDR();

    // Sign with Freighter
    const signedResponse = await signTransaction(xdr, {
      networkPassphrase: Networks.TESTNET,
    });

    const signedXdr =
      typeof signedResponse === "string"
        ? signedResponse
        : (signedResponse as any)?.signedTxXdr || (signedResponse as any)?.xdr;

    if (!signedXdr) {
      return { success: false, error: "Transaction signing failed or was rejected" };
    }

    // Submit
    const tx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
    const result = await server.submitTransaction(tx as any);

    return { success: true, hash: (result as any).hash };
  } catch (error: any) {
    console.error("Payment error:", error);
    if (error?.message?.includes("User declined") || error?.message?.includes("rejected")) {
      return { success: false, error: "Transaction rejected by user" };
    }
    return {
      success: false,
      error:
        error?.response?.data?.extras?.result_codes?.operations?.join(", ") ||
        error?.message ||
        "Transaction failed",
    };
  }
};

// Fund account via Friendbot (testnet only)
export const fundWithFriendbot = async (publicKey: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    if (response.ok) {
      toast.success("Account funded with testnet XLM!");
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

// Truncate address for display
export const truncateAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};
