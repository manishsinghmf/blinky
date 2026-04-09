import {
  ACTIONS_CORS_HEADERS,
  ActionGetResponse,
  ActionPostResponse,
  createPostResponse,
} from "@solana/actions";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { getSolanaCluster, getSolanaConnection } from "@/src/server/solana/connection";
import {
  SendSolParams,
  SendSolValidationError,
} from "@/src/server/validation/send-sol";

const DEFAULT_ICON =
  "https://placehold.co/512x512/png?text=Send+SOL&font=playfair-display";

function formatAmount(amount: number): string {
  return amount.toLocaleString("en-US", {
    maximumFractionDigits: 9,
  });
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function withJsonHeaders(init?: ResponseInit): ResponseInit {
  return {
    ...init,
    headers: {
      ...ACTIONS_CORS_HEADERS,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  };
}

export function createValidationErrorResponse(error: unknown): Response {
  const message =
    error instanceof SendSolValidationError
      ? error.message
      : "Unable to process the Send SOL action";
  const status = error instanceof SendSolValidationError ? error.status : 500;

  return Response.json(
    {
      error: {
        message,
      },
    },
    withJsonHeaders({ status }),
  );
}

export function buildSendSolGetResponse(
  requestUrl: URL,
  params: SendSolParams,
): ActionGetResponse {
  const actionUrl = new URL("/api/actions/send-sol", requestUrl.origin);
  actionUrl.searchParams.set("to", params.recipientBase58);
  actionUrl.searchParams.set("amount", String(params.amount));

  const formattedAmount = formatAmount(params.amount);

  return {
    icon: DEFAULT_ICON,
    title: `Send ${formattedAmount} SOL`,
    description: `Transfer ${formattedAmount} SOL on ${getSolanaCluster()} to ${shortenAddress(params.recipientBase58)}.`,
    label: `Send ${formattedAmount} SOL`,
    links: {
      actions: [
        {
          type: "post",
          label: `Send ${formattedAmount} SOL`,
          href: actionUrl.toString(),
        },
      ],
    },
  };
}

export async function buildSendSolPostResponse(
  sender: PublicKey,
  params: SendSolParams,
): Promise<ActionPostResponse> {
  const connection = getSolanaConnection();
  const latestBlockhash = await connection.getLatestBlockhash();

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: params.recipient,
      lamports: Math.round(params.amount * LAMPORTS_PER_SOL),
    }),
  );

  transaction.feePayer = sender;
  transaction.recentBlockhash = latestBlockhash.blockhash;
  transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;

  return createPostResponse({
    fields: {
      type: "transaction",
      transaction,
      message: `Ready to send ${formatAmount(params.amount)} SOL to ${shortenAddress(
        params.recipientBase58,
      )}.`,
    },
  });
}

export function createActionJsonResponse(payload: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(payload), withJsonHeaders(init));
}

