"use client";

import { useState } from "react";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface CopyButtonProps {
  text: string;
  label?: string;
}

type CopyState = "idle" | "copied" | "error";

export function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>("idle");

  async function handleCopy() {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("error");
    } finally {
      setTimeout(() => setState("idle"), 1800);
    }
  }

  return (
    <Button
      variant="secondary"
      onClick={handleCopy}
      className="text-xs px-3 py-1.5"
      aria-live="polite"
    >
      {state === "copied" && (
        <>
          <Check size={14} /> Copied
        </>
      )}
      {state === "error" && (
        <>
          <AlertTriangle size={14} /> Couldn&apos;t copy
        </>
      )}
      {state === "idle" && (
        <>
          <Copy size={14} /> {label}
        </>
      )}
    </Button>
  );
}