export type BlinkLinkResult = {
  actionUrl: string;
  dialToUrl: string;
  blinkUrl: string;
};

export function buildSendSolActionUrl(
  origin: string,
  recipientAddress: string,
  amount: string,
): string {
  const url = new URL("/api/actions/send-sol", origin);
  url.searchParams.set("to", recipientAddress.trim());
  url.searchParams.set("amount", amount.trim());
  return url.toString();
}

export function buildDialToUrl(actionUrl: string): string {
  const dial = new URL("https://dial.to/");
  dial.searchParams.set("action", `solana-action:${actionUrl}`);
  return dial.toString();
}

export function buildBlinkLinks(
  origin: string,
  recipientAddress: string,
  amount: string,
): BlinkLinkResult {
  const actionUrl = buildSendSolActionUrl(origin, recipientAddress, amount);
  return {
    actionUrl,
    dialToUrl: buildDialToUrl(actionUrl),
    blinkUrl: `solana-action:${actionUrl}`
  };
}

