"use client";

import { FormEvent, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { buildBlinkLinks } from "@/src/lib/blinks";

type ResultState = {
  actionUrl: string;
  dialToUrl: string;
};

function validateRecipientAddress(value: string): string | null {
  try {
    new PublicKey(value.trim());
    return null;
  } catch {
    return "Enter a valid Solana wallet address.";
  }
}

function validateAmount(value: string): string | null {
  if (!value.trim()) {
    return "Enter an amount in SOL.";
  }

  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "Amount must be a valid number.";
  }

  if (amount <= 0) {
    return "Amount must be greater than zero.";
  }

  return null;
}

export default function HomePage() {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<ResultState | null>(null);
  const [copiedField, setCopiedField] = useState<"action" | "dial" | null>(null);

  const recipientError = useMemo(
    () => (recipientAddress ? validateRecipientAddress(recipientAddress) : null),
    [recipientAddress],
  );
  const amountError = useMemo(
    () => (amount ? validateAmount(amount) : null),
    [amount],
  );
  const formError = recipientError ?? amountError;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextRecipientError = validateRecipientAddress(recipientAddress);
    const nextAmountError = validateAmount(amount);

    if (nextRecipientError || nextAmountError) {
      setResult(null);
      return;
    }

    const links = buildBlinkLinks(
      window.location.origin,
      recipientAddress,
      amount,
    );
    setResult(links);
  }

  async function handleCopy(value: string, field: "action" | "dial") {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(null), 1800);
  }

  return (
    <main className="page-shell">
      <div className="page-frame">
        <section className="hero">
          <span className="eyebrow">Blink POC • Send SOL • Devnet-first</span>
          <h1>Generate a blink, then demo how it actually moves.</h1>
          <p>
            This proof of concept generates a stateless Solana Action URL for a
            fixed Send SOL transfer, then wraps it in a shareable blink link for
            testing through a blink-aware client such as dial.to.
          </p>
        </section>

        <section className="grid">
          <div className="panel">
            <h2>Send SOL Generator</h2>
            <p>
              Fill in the recipient and amount, then the app will produce both
              the raw action endpoint and the shareable blink link.
            </p>

            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="recipientAddress">Recipient address</label>
                <input
                  id="recipientAddress"
                  name="recipientAddress"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Enter the Solana wallet that should receive SOL"
                  value={recipientAddress}
                  onChange={(event) => setRecipientAddress(event.target.value)}
                />
                <span className="hint">
                  The generated action will always target this wallet.
                </span>
                {recipientError ? <span className="error">{recipientError}</span> : null}
              </div>

              <div className="field">
                <label htmlFor="amount">Amount (SOL)</label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.000000001"
                  placeholder="0.1"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
                <span className="hint">
                  This POC uses a fixed amount, so every signer sees the exact
                  transfer you configured here.
                </span>
                {amountError ? <span className="error">{amountError}</span> : null}
              </div>

              <div className="button-row">
                <button
                  className="primary-button"
                  type="submit"
                  disabled={Boolean(formError) || !recipientAddress || !amount}
                >
                  Generate Blink
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setRecipientAddress("");
                    setAmount("");
                    setResult(null);
                  }}
                >
                  Reset
                </button>
              </div>
            </form>

            {result ? (
              <div className="result-card">
                <div>
                  <div className="result-label">Raw action URL</div>
                  <div className="url-box">{result.actionUrl}</div>
                </div>

                <div className="button-row">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => handleCopy(result.actionUrl, "action")}
                  >
                    {copiedField === "action" ? "Copied action URL" : "Copy action URL"}
                  </button>
                  <a
                    className="secondary-button"
                    href={result.actionUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open action JSON
                  </a>
                </div>

                <div>
                  <div className="result-label">Shareable dial.to blink</div>
                  <div className="url-box">{result.dialToUrl}</div>
                </div>

                <div className="button-row">
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => handleCopy(result.dialToUrl, "dial")}
                  >
                    {copiedField === "dial" ? "Copied blink URL" : "Copy blink URL"}
                  </button>
                  <a
                    className="secondary-button"
                    href={result.dialToUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in dial.to
                  </a>
                </div>

                <span className="status">
                  Blink generated. The reliable demo path for this POC is the
                  dial.to link above.
                </span>
              </div>
            ) : null}
          </div>

          <aside className="blink-preview">
            <div className="preview-card">
              <div className="preview-art">
                <strong>Send SOL, with the blink flow visible.</strong>
              </div>
              <div className="preview-body">
                <span>What this POC demonstrates</span>
                <h3>Action URL first. Wallet popup only in a blink-aware client.</h3>
                <p>
                  The generated raw URL is the Solana Action endpoint. It does
                  not guarantee a wallet popup on a normal webpage by itself.
                </p>
                <div className="pill-row">
                  <span className="pill">Stateless link</span>
                  <span className="pill">Fixed amount</span>
                  <span className="pill">Devnet-first</span>
                </div>
              </div>
            </div>

            <div className="panel">
              <h3>How to use the generated blink</h3>
              <ul className="list">
                <li>
                  Open the dial.to link to test the blink in a blink-aware flow.
                </li>
                <li>
                  The raw action URL usually returns JSON metadata in a normal browser.
                </li>
                <li>
                  A wallet popup requires a blink-aware client or supporting extension.
                </li>
                <li>
                  Sharing on X is valid, but inline execution there is not guaranteed
                  for unregistered actions.
                </li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
