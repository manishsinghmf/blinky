import { Connection, clusterApiUrl } from "@solana/web3.js";

type SupportedCluster = "devnet" | "testnet" | "mainnet-beta";

export function getSolanaCluster(): SupportedCluster {
  const cluster = process.env.SOLANA_CLUSTER;

  if (
    cluster === "devnet" ||
    cluster === "testnet" ||
    cluster === "mainnet-beta"
  ) {
    return cluster;
  }

  return "devnet";
}

export function getSolanaRpcUrl(): string {
  return process.env.SOLANA_RPC_URL ?? clusterApiUrl(getSolanaCluster());
}

export function getSolanaConnection(): Connection {
  return new Connection(getSolanaRpcUrl(), "confirmed");
}

