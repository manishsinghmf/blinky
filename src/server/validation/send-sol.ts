import { PublicKey } from "@solana/web3.js";

export type SendSolParams = {
  amount: number;
  recipient: PublicKey;
  recipientBase58: string;
};

export class SendSolValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "SendSolValidationError";
    this.status = status;
  }
}

export function parseRecipientAddress(value: string | null): {
  recipient: PublicKey;
  recipientBase58: string;
} {
  if (!value) {
    throw new SendSolValidationError("Missing required query parameter: to");
  }

  try {
    const recipient = new PublicKey(value);
    return { recipient, recipientBase58: recipient.toBase58() };
  } catch {
    throw new SendSolValidationError("Invalid recipient address");
  }
}

export function parseAmount(value: string | null): number {
  if (!value) {
    throw new SendSolValidationError("Missing required query parameter: amount");
  }

  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    throw new SendSolValidationError("Amount must be a valid number");
  }

  if (amount <= 0) {
    throw new SendSolValidationError("Amount must be greater than zero");
  }

  return amount;
}

export function parseSendSolParams(url: URL): SendSolParams {
  const { recipient, recipientBase58 } = parseRecipientAddress(
    url.searchParams.get("to"),
  );
  const amount = parseAmount(url.searchParams.get("amount"));

  return {
    amount,
    recipient,
    recipientBase58,
  };
}

export async function parseSenderAccount(request: Request): Promise<PublicKey> {
  const body = (await request.json()) as { account?: string };
  if (!body.account) {
    throw new SendSolValidationError("Missing required body field: account");
  }

  try {
    return new PublicKey(body.account);
  } catch {
    throw new SendSolValidationError("Invalid sender account");
  }
}

